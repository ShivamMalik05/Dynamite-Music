const { handleButton } = require('./buttons/button');
const { handleSelect } = require('./buttons/select');
const { handleModal } = require('./modals/modal');
const { handleRoleButton } = require('./modals/roleButton');

module.exports = {
  handleButton,
  handleSelect,
  handleModal,
  handleRoleButton,
  isEmbedButton: (id) => id.startsWith('embed_') || id.startsWith('eb_'),
  isEmbedSelect: (id) => id.startsWith('eb_') && id.endsWith('_select'),
  isEmbedModal: (id) => id.startsWith('modal_'),
  isRoleButton: (id) => id.startsWith('eb_action_role_'),
};
