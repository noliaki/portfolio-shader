const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      use: 'raw-loader',
    })

    if (!dev) {
      config.optimization.minimize = true
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: true },
          },
        }),
      ]
    }

    return config
  },
}
