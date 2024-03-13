import { useEffect, useRef, useState , useCallback} from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import {sortPlacesByDistance} from './loc.js';

// const storeIds=JSON.parse(localStorage.getItem('selectedPlaces')) || [];
//     const storedPlaces = storeIds.map(id=>
//       AVAILABLE_PLACES.find((place)=> place.id===id)
//       );

function App() {
  const selectedPlace = useRef();
  const [modalIsOpen,setmodalIsOpen] = useState(false);
  const [availablePlaces,setAvailablePlaces]=useState([]);
  const [pickedPlaces, setPickedPlaces] = useState([]);

  useEffect(()=>{
    const storeIds=JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    const storedPlaces = storeIds.map(id=>
      AVAILABLE_PLACES.find((place)=> place.id===id)
      );
      setPickedPlaces(storedPlaces);
  },[]);

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition((position)=>{
      const sortedPlaces= sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.latitude,
        position.longitude
      );
      setAvailablePlaces(sortedPlaces);
    });
  }, []);
  

  function handleStartRemovePlace(id) {
    setmodalIsOpen(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setmodalIsOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    const storeIds=JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    if(storeIds.indexOf(id)===-1){
      localStorage.setItem(
        'selectedPlaces',
        JSON.stringify([id,...storeIds])
      );
    }
  }
  const handleRemovePlace=useCallback(function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    setmodalIsOpen(false);
    
    const storeIds=JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    localStorage.setItem(
      'selectedPlaces',
      JSON.stringify(storeIds.filter((id)=>id !== selectedPlace.current)));
  },[]);
  

  return (
    <>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
