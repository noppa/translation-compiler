const t = require('babel-types')
const {get} = require('get-optional')

module.exports = function() {

  function isTranslationSource(node) {
    return t.isLiteral(node) && /translation/.test(node.value) // TODO
  }

  function visitTranslationsReference(path) {
    // TODO: Handle case where this is not a direct member expr but a variable decl or something.
    const {parent, node} = path
    if (!(t.isMemberExpression(parent) && node === parent.object)) return

    if (!t.isIdentifier(parent.property)) {
      throw new Error('Computed access is not supported')
    }

    let result = parent.property.name
    if (t.isMemberExpression(path.parentPath.parent)) {
      result += `.${visitTranslationsReference(path.parentPath)}`
    }
    return result
  }

  return {
    visitor: {
      ImportDeclaration(path) {
        const {node} = path
        if (!isTranslationSource(node.source) || !node.specifiers) return

        const defaultImport = node.specifiers.find(t.isImportDefaultSpecifier)
        if (!defaultImport) return

        const binding = path.scope.bindings[defaultImport.local.name]
        
        const imports = binding.referencePaths.map(visitTranslationsReference)
        node.source.value += '?' + imports.join(',')
      },
    },
  }
}
