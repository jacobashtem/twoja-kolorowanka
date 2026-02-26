/**
 * @typedef {Object} WPPost
 * @property {number} id
 * @property {string} slug
 * @property {{ rendered: string }} title
 * @property {{ rendered: string }} excerpt
 * @property {{ rendered: string }} content
 * @property {string} date
 * @property {string} modified
 * @property {number} featured_media
 * @property {number[]} categories
 * @property {number[]} tags
 * @property {Object} [_embedded]
 */

/**
 * @typedef {Object} WPCategory
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {number} count
 * @property {string} description
 */

/**
 * @typedef {Object} WPMedia
 * @property {number} id
 * @property {string} source_url
 * @property {string} alt_text
 * @property {Object} media_details
 */

/**
 * @typedef {Object} WPTag
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 */

/**
 * @typedef {Object} BlogPost
 * @property {number} id
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt - stripped HTML
 * @property {string} content - raw HTML from WP
 * @property {string} date - ISO
 * @property {string} dateFormatted - "20 lutego 2026"
 * @property {number} readingTime - minuty
 * @property {Object|null} thumbnail
 * @property {string} thumbnail.url
 * @property {string} thumbnail.alt
 * @property {number} thumbnail.width
 * @property {number} thumbnail.height
 * @property {BlogCategory|null} category
 * @property {string[]} tags
 */

/**
 * @typedef {Object} BlogCategory
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {string} emoji
 * @property {string} color
 */

/**
 * @typedef {Object} CategoryConfig
 * @property {string} slug
 * @property {string} emoji
 * @property {string} color
 * @property {string} bgColor
 * @property {string} tagBg
 * @property {string} tagColor
 * @property {string} [layoutType]
 * @property {boolean} homepage
 * @property {number} [homepageOrder]
 */

export default {}
