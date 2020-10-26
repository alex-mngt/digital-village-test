// Import style to allow webpack to pre-process SCSS in the dist folder
import "../style/style.scss";

// Import Bootstrap
import "bootstrap";

// Import Jquery
import $ from "jquery";

// defining global variables
let globalFilter = "";
let mainTitle = $("#main-title");
const loadMoreButton = $("#load-more-button");
const searchButton = $("#search-button");
let page = 1;

// Wait for all the content to load
window.addEventListener("load", () => {
  // First arbitrary search for digital
  apiCallAndLogic();

  //   Listen to click on menu items
  const filters = ["all", "movie", "series", "episode"];
  let activeLink;

  filters.forEach((filter) => {
    $(`#${filter}-filter`).click(() => {
      switch (filter) {
        case "all":
          globalFilter = "";
          mainTitle.html("Tous les films, séries et épisodes");
          activeLink = $(".nav-link.active");
          if (activeLink) {
            activeLink.removeClass("active");
          }
          $("#all-filter > p").addClass("active");
          break;
        case "movie":
          globalFilter = "movie";
          mainTitle.html("Tous les films");
          activeLink = $(".nav-link.active");
          if (activeLink) {
            activeLink.removeClass("active");
          }
          $("#movie-filter > p").addClass("active");
          break;
        case "series":
          globalFilter = "series";
          mainTitle.html("Toutes les séries");
          activeLink = $(".nav-link.active");
          if (activeLink) {
            activeLink.removeClass("active");
          }
          $("#series-filter > p").addClass("active");
          break;
        case "episode":
          globalFilter = "episode";
          mainTitle.html("Tous les épisodes");
          activeLink = $(".nav-link.active");
          if (activeLink) {
            activeLink.removeClass("active");
          }
          $("#episode-filter > p").addClass("active");
          break;
        default:
          console.log("error");
      }

      page = 1;

      apiCallAndLogic();
    });
  });

  //   Listen to click on the research button
  searchButton.click(() => {
    page = 1;
    apiCallAndLogic();
  });

  //   Listen to click on load more button
  loadMoreButton.click(() => {
    page++;
    apiCallAndLogic();
  });
});

// Helper functions (generate : return markup / create : DOM manip )

function generateMovie(movie, i) {
  return $(`
  <div id="${
    movie.imdbID
  }" class="col movie p-0 px-md-1 mb-5" style="animation-delay: 0.${
    i * 10
  }s !important">
      <div class="poster-more-infos">
          <img
              class="w-100 rounded-top"
              src="${
                movie.Poster !== "N/A"
                  ? movie.Poster
                  : "/assets/pictures/poster-placeholder.png"
              }"
              alt="poster du film"
          />
              <div
                  class="movie-more-infos p-3 rounded-top h-100 position-absolute d-lg-flex d-none flex-column justify-content-center align-items-center"
              >
                  <div class="spinner-border text-light" role="status">
                      <span class="sr-only">Loading...</span>
                  </div>
              </div>
          </div>
          <div class="movie-main-infos p-3 rounded-bottom">
              <p class="movie-title mb_3">${movie.Title}</p>
              <p class="movie-year m-0">${movie.Year}</p>
              <button
                  disabled
                  class="more-infos-button btn d-lg-none w-100 mt-3"
              >
                  <div class="spinner-border text-light" role="status">
                      <span class="sr-only">Loading...</span>
                  </div>
              </button>
      </div>
  </div>
`);
}

function generateMovieMoreInfos(movie) {
  return `
  <div class="infos-wrapper w-100">
      <p class="type">${formatType(movie.Type)}</p>
      <p class="genre">
          <span class="legend"> Genre :</span> ${shortenCSV(movie.Genre)}
      </p>
      <p class="director">
          <span class="legend">Réalisateur :</span> ${shortenCSV(
            movie.Director
          )}
      </p>
      <div class="rating mb-3">
          <span class="legend">Note : </span>
          <svg
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          class="ipc-icon ipc-icon--star-inline"
          viewBox="0 0 24 24"
          fill="#f5c518"
          role="presentation"
          >
          <path
              d="M12 20.1l5.82 3.682c1.066.675 2.37-.322 2.09-1.584l-1.543-6.926 5.146-4.667c.94-.85.435-2.465-.799-2.567l-6.773-.602L13.29.89a1.38 1.38 0 0 0-2.581 0l-2.65 6.53-6.774.602C.052 8.126-.453 9.74.486 10.59l5.147 4.666-1.542 6.926c-.28 1.262 1.023 2.26 2.09 1.585L12 20.099z"
          ></path>
          </svg>
          <span>${movie.imdbRating}</span>
      </div>
  </div>
  <button
  class="more-infos-button btn mx-auto d-block mb-3 ${movie.imdbID}-more-button"
  type="button"
  >
          En savoir plus
  </button>
  `;
}

function generateModal(movie) {
  return `
    <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>${movie.Title}</h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>
              <span class="legend">Réalisateur : </span>
              ${movie.Director}
            </p>
            <p>
              <span class="legend">Scénaristes : </span>
              ${movie.Writer}
            </p>
            <p>
              <span class="legend">Acteurs : </span>
              ${movie.Actors}
            </p>
            <p>
              <span class="legend">Durée : </span>
              ${movie.Runtime}
            </p>
            <p>
              <span class="legend">Genre : </span>
              ${movie.Genre}
            </p>
            <p>
              <span class="legend">Synopsis : </span>
              ${movie.Plot}
            </p>
            <p>
              <span class="legend">Date de sortie : </span>
              ${movie.Released}
            </p>
            <p>
              <span class="legend">Récompenses : </span>
              ${movie.Awards}
            </p>
            <p>
              <span class="legend">Notes IMDB : </span>
              ${movie.Ratings[0] ? movie.Ratings[0].Value : "N/A"}
            </p>
          </div>
        </div>
      </div>
    `;
}

function createRows(movies, add) {
  const moviesWrapper = $("#movies");

  // Empty the movies wrapper before feeding it with the latest results
  if (!add) {
    moviesWrapper.empty();
  }

  if (movies) {
    //   Create a row
    moviesWrapper.append(
      `<div id="${page}-row" class="row row-cols-lg-5 row-cols-md-2 row-cols-1"></div>`
    );

    for (let i = 0; i < movies.length; i++) {
      const pageRow = $(`#${page}-row`);
      // Feed the row with movie cards
      pageRow.append(generateMovie(movies[i], i));

      // Get more informations about each movie
      $.ajax({
        url: `http://www.omdbapi.com/?apikey=ed796b6&i=${movies[i].imdbID}`,
        dataType: "json",
        indexValue: i,
        success: function (data) {
          movies[this.indexValue] = data;

          const movie = $(`#${movies[this.indexValue].imdbID}`);

          const movieMoreInfo = movie.find(".movie-more-infos");

          movieMoreInfo.removeClass("justify-content-center");
          movieMoreInfo.addClass("justify-content-between");
          movieMoreInfo.html(generateMovieMoreInfos(movies[this.indexValue]));

          const moreInfosMainButton = movie.find(
            ".movie-main-infos .more-infos-button"
          );
          moreInfosMainButton.removeAttr("disabled");
          moreInfosMainButton.html("En savoir plus");

          const moreInfosButtons = movie.find(".more-infos-button");
          moreInfosButtons.click(() => {
            const modal = $("#movie-modal");
            modal.html(generateModal(movies[this.indexValue]));
            modal.modal();
          });
        },
      });
    }
  } else {
    moviesWrapper.append(
      "<p>Aucune correspondance trouvée, essayez une autre recherche ;-)"
    );
  }
}

function formatType(type) {
  switch (type) {
    case "series":
      return "Série";
      break;
    case "movie":
      return "Film";
      break;
    case "episode":
      return `Épisode`;
      break;
    case "game":
      return "Jeu";
      break;
    default:
      return "Erreur";
  }
}

function shortenCSV(csvStr) {
  const genreArray = csvStr.split(",");
  if (genreArray.length > 3) {
    return `${genreArray.slice(0, 3).join(", ")} ...`;
  } else {
    return csvStr;
  }
}

function apiCallAndLogic() {
  //   Make a default search value to digital
  const searchInputValue = $("#search-input").val()
    ? $("#search-input").val()
    : "digital";

  $.ajax({
    url: `http://www.omdbapi.com/?apikey=ed796b6&type=${globalFilter}&s=${searchInputValue}&page=${page}`,
    dataType: "json",
    success: function (data) {
      if (!data.Search || page * data.Search.length >= data.totalResults) {
        loadMoreButton.removeClass("d-block");
        loadMoreButton.addClass("d-none");
      } else {
        loadMoreButton.addClass("d-block");
        loadMoreButton.removeClass("d-none");
      }
      createRows(data.Search, page !== 1);
    },
  });
}
