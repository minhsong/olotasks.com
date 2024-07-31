import React from "react";
import PropTypes from "prop-types";
import { Modal, Box, Typography, Button } from "@mui/material";

const ConfirmModal = ({
  title,
  children,
  confirmHandle,
  closeHandle,
  open,
}) => {
  return (
    <Modal
      open={open}
      onClose={closeHandle}
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="confirm-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Box id="confirm-modal-description" sx={{ mt: 2 }}>
          {children}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button onClick={closeHandle} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={confirmHandle} variant="contained" color="primary">
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  confirmHandle: PropTypes.func.isRequired,
  closeHandle: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ConfirmModal;
