const minifyHtml = require('@minify-html/js')
const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')
const cfg = minifyHtml.createConfiguration({
  do_not_minify_doctype: true,
  keep_spaces_between_attributes: true,
  ensure_spec_compliant_unquoted_attribute_values: true,
  minify_js: true,
})
const minified = minifyHtml
  .minify(readFileSync(join(__dirname, '../src/graphiql.html')), cfg)
  .toString('utf-8')
writeFileSync(
  join(__dirname, '../src/graphiqlHTML.ts'),
  `export default ${JSON.stringify(minified)}`,
)
