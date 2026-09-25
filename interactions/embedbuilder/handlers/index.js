const { handleButton } = require('./buttons');
const { handleModal, handleRoleButton } = require('./modals');

module.exports = {
  handleButton,
  handleModal,
  handleRoleButton,
  isEmbedButton: (id) => id.startsWith('embed_') || id.startsWith('eb_'),
  isEmbedModal: (id) => id.startsWith('modal_'),
  isRoleButton: (id) => id.startsWith('eb_action_role_'),
};
