const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let config = {
  entry: "./src/script/index.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./script/bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
          "postcss-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "/style/style.css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "./src/index.html", to: "." },
        { from: "./src/mock/digimon.mock.json", to: "./mock" },
        { from: "./src/assets", to: "./assets" },
      ],
    }),
  ],
};
module.exports = config;
