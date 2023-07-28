import React, {useRef} from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

const EditAuthentionModal = (props) => {

    const form = useRef();
    const checkBtn = useRef();

    const handleEditAndClose = (e) => {
        e.preventDefault();

        props.onHide();
        props.handleEdit(props.formData);
    }
    return (
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Authenticate profile edit
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditAndClose} enctype="multipart/form-data" ref={form}>
                <Modal.Body>
                    <div className="form-group">
                        <label htmlFor="oldEmail">Current Email</label>
                        <Input
                            type="text"
                            className="form-control"
                            name="oldEmail"
                            value={props.formData.oldEmail}
                            onChange={props.setFormData}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="oldPassword">Current Password</label>
                        <Input
                            type="password"
                            className="form-control"
                            name="oldPassword"
                            value={props.formData.oldPassword}
                            onChange={props.setFormData}
                        />
                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-success" type="submit">Confirm</button>
                    <CheckButton style={{display: "none"}} ref={checkBtn}/>
                    <button className="btn btn-outline-secondary" type="button" onClick={props.onHide}>Close</button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditAuthentionModal;