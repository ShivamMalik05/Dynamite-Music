const {
  handleButton,
  handleModal,
  handleRoleButton,
  isEmbedButton,
  isEmbedModal,
  isRoleButton,
} = require('./handlers');
const {
  buildFront,
  buildEmbedFromBlocks,
} = require('./core');

module.exports = {
  handleButton,
  handleModal,
  handleRoleButton,
  buildFront,
  buildEmbedFromBlocks,
  isEmbedButton,
  isEmbedModal,
  isRoleButton,
};
