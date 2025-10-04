const { addBeforeLoader, loaderByName } = require('@craco/craco');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Deshabilitar React Fast Refresh para evitar errores
      if (env === 'development') {
        const reactRefreshPluginIndex = webpackConfig.plugins.findIndex(
          plugin => plugin.constructor.name === 'ReactRefreshPlugin'
        );

        if (reactRefreshPluginIndex >= 0) {
          webpackConfig.plugins.splice(reactRefreshPluginIndex, 1);
        }

        // Remover React Refresh de las reglas de babel
        const babelLoaderFilter = rule => {
          return rule.loader && rule.loader.includes('babel-loader');
        };

        const babelLoaderRule = webpackConfig.module.rules.find(rule => {
          if (rule.oneOf) {
            return rule.oneOf.find(babelLoaderFilter);
          }
          return babelLoaderFilter(rule);
        });

        if (babelLoaderRule && babelLoaderRule.oneOf) {
          const babelRule = babelLoaderRule.oneOf.find(babelLoaderFilter);
          if (babelRule && babelRule.options && babelRule.options.plugins) {
            babelRule.options.plugins = babelRule.options.plugins.filter(
              plugin => {
                if (typeof plugin === 'string') {
                  return !plugin.includes('react-refresh');
                }
                if (Array.isArray(plugin)) {
                  return !plugin[0].includes('react-refresh');
                }
                return true;
              }
            );
          }
        }
      }

      return webpackConfig;
    },
  },
};
