/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

 function escapeBrackets(str) {
  return str.replace(/([\]\[])/g, '\\$1');
 }

// Exports an array with custom converters used by to-markdown library.
export default [
	// Converting code blocks with class name matching output from marked library.
	{
		filter: ( node ) =>  {
			const regexp = /lang-(.+)/;

			return node.nodeName === 'PRE' &&
				node.firstChild &&
				node.firstChild.nodeName === 'CODE' &&
				regexp.test( node.firstChild.className );
		},
		replacement: ( content, node ) => {
			const regexp = /lang-(.+)/;
			const lang = regexp.exec(node.firstChild.className)![1];

			return '\n\n``` ' + lang + '\n' + node.firstChild.textContent + '\n```\n\n';
		}
	},
	// Converting empty links.
	{
		filter: ( node ) => {
			return node.nodeName === 'A' && !node.getAttribute( 'href' );
		},

		replacement: ( content, node ) => {
			const title = node.title ? `"${node.title}"` : '';

			return `[${ content }](${ title })`;
		}
	},
	// Headers - fixing newline at the beginning.
	{
		filter: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
		replacement: ( content, node ) => {
			const hLevel = node.nodeName.charAt( 1 );
			let hPrefix = '';

			for ( let i = 0; i < hLevel; i++ ) {
				hPrefix += '#';
			}

			return hPrefix + ' ' + content + '\n';
		}
	},
	// Inline code - fixing backticks inside code blocks.
	{
		filter: ( node ) => {
			const hasSiblings = node.previousSibling || node.nextSibling;
			const isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings;

			return node.nodeName === 'CODE' && !isCodeBlock;
		},
		replacement: ( content ) => {
			// If content starts or ends with backtick - use double backtick.
			if ( content.indexOf( '`' ) > -1 ) {
				return '`` ' + content + ' ``';
			}

			return '`' + content + '`';
		}
  },
  // Filter to produce single-line markdown image reference
  // from the figure/figcaption/img construct of the image plugin.
	{
		filter: ( node ) => {
			return node.nodeName === 'FIGURE' && !!node.querySelector('img');
		},
		replacement: ( content, node ) => {
      const url = node.querySelector('img').getAttribute('src');
      const captionNode = node.querySelector('figcaption');
      let caption = '';

      if (captionNode) {
        caption = escapeBrackets(captionNode.textContent);
      }

      return `![${caption}](${url})`;
		}
	},
];
