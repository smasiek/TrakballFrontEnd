import React, {useEffect, useRef, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import def from '../assets/img/defPlace.jpg';
import PlaceService from "../services/place.service";

const PlacePhotoChangeModal = ({updatePlaces, ...props}) => {

    const form = useRef();
    const checkBtn = useRef();

    const [place, setPlace] = useState({});
    const [placeId, setPlaceId] = useState(0);

    const [imageSelected, setImageSelected] = useState("");
    const [imagePreview, setImagePreview] = useState(def);

    useEffect(() => {
        setPlaceId(props.place_id);
    }, [props.place_id]);

    useEffect(() => {
        const tempPlace = props.places.filter(item => item.place_id === placeId)[0];
        !!tempPlace && setPlace(tempPlace);
    }, [placeId, props.places]);

    useEffect(() => {
        setImagePreview(place.photo_url || def);
        setImageSelected("")
    }, [place, props.show]);

    useEffect(() => {
    }, [imagePreview]);

    useEffect(() => {
        if (!!imageSelected) {
            const reader = new FileReader();
            reader.readAsDataURL(imageSelected);

            reader.onloadend = function (e) {
                setImagePreview(reader.result)
            };
        }
    }, [imageSelected]);

    const handleImageChange = (e) => {
        setImageSelected(e.target.files[0]);
    };

    const handleEditAndClose = (e) => {
        e.preventDefault();

        const formDataWithFile = new FormData();
        formDataWithFile.append("file", imageSelected);
        formDataWithFile.append("placeId", place.place_id)
        PlaceService.updatePhoto(formDataWithFile).then(
            (response) => {
                const tempPlaces = props.places.filter(item => item.place_id !== placeId)
                place.photo_url = response.data.message;
                tempPlaces.push(place)
                updatePlaces(tempPlaces)
                props.onHide();
            }
        )
    };

    return (
        <div>
            <Modal
                {...props}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Update place photo
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditAndClose} encType="multipart/form-data" ref={form}>
                    <Modal.Body>
                        <h5>{place.primary}</h5>
                        <img
                            id="image-preview"
                            src={(!!place.photo) ? place.photo : imagePreview}
                            alt="profile-img"
                            className="profile-img-card"
                            style={{objectFit: "cover"}}
                        />
                        <Input
                            id="file-selector"
                            type="file"
                            className="form-control"
                            name="photo"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-outline-success" type="submit">Confirm</button>
                        <CheckButton style={{display: "none"}} ref={checkBtn}/>
                        <button className="btn btn-outline-secondary" type="button" onClick={props.onHide}>Close
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default PlacePhotoChangeModal;