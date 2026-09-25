const {
  makeSeparator,
  makeThumbnail,
  buildEmbedFromBlocks,
  buildMessageOnly,
  V1_BLOCKS,
  V2_BLOCKS,
} = require('./builders');
const {
  buildStartPage,
  buildBuilderPage,
  buildHelpPage,
} = require('./pages');
const {
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildStyleMenu,
  buildHistoryPanel,
} = require('./menus');

module.exports = {
  makeSeparator,
  makeThumbnail,
  buildEmbedFromBlocks,
  buildMessageOnly,
  buildStartPage,
  buildBuilderPage,
  buildHelpPage,
  buildBlocksMenu,
  buildManageBlocksMenu,
  buildButtonsMenu,
  buildStyleMenu,
  buildHistoryPanel,
  V1_BLOCKS,
  V2_BLOCKS,
};
