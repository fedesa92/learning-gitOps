function transformImportMetaForJest({ types }) {
  return {
    visitor: {
      MetaProperty(path) {
        if (
          path.node.meta.name === 'import' &&
          path.node.property.name === 'meta'
        ) {
          path.replaceWith(
            types.objectExpression([
              types.objectProperty(
                types.identifier('env'),
                types.objectExpression([]),
              ),
            ]),
          );
        }
      },
    },
  };
}

module.exports = {
  plugins: [transformImportMetaForJest],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
};
