import { useEffect,useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { useParams } from "react-router-dom";
import './Albums.css';
function Albums() {
  const userJS = localStorage.getItem("user");
  const user = JSON.parse(userJS);
  const MyUserId = user?.id;
  const[allalbums,setAllAlbum]=useState([])
  const [albumArray, setAlbumArray] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [filteredAlbum, setFilteredAlbums] = useState([]);
  const [albums,setAlbums]=useState({ 
    userId:MyUserId,
    id:"",
    title:""
  });
  const [showAddAlbums,setShowAddAlbums]=useState(false);
    // Fetch albums from API
  useEffect(() => {
    if (MyUserId) {
      fetch(`http://localhost:3001/albums`)
        .then((response) => response.json())
        .then((data) => setAllAlbum(data))
        .catch((error) => console.error("Error fetching albums:", error));
    
      fetch(`http://localhost:3001/albums?userId=${MyUserId}`)
        .then((response) => response.json())
        .then((data) => setAlbumArray(data))
        .catch((error) => console.error("Error fetching albums:", error));
    }
  }, [MyUserId]);
    // Filter albums based on search 
  useEffect(() => {
    const result = albumArray.filter((album) => {
      return (
        (searchId ? album.id.toString().includes(searchId) : true) &&
        (searchTitle
          ? album.title.toLowerCase().includes(searchTitle.toLowerCase())
          : true)
      );
    });
    setFilteredAlbums(result);
  }, [searchId, searchTitle, albumArray]);
    // Handle adding a new album
  const handleAddAlbums = () => {
    const nextalbum=Math.max(0, ...allalbums.map((obj) => +obj.id)) + 1;
    const newAlbumObj = {
      userId: +MyUserId,
      title: albums.title,
      id: `${nextalbum}`,
    };
    if (!albumArray.find((data) => data.id === newAlbumObj.id)) {
      fetch("http://localhost:3001/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAlbumObj),
      })
        .then((response) => response.json())
        .then((data) => {
          setAlbumArray([data, ...albumArray]);
          setFilteredAlbums([data, ...filteredAlbum]);
          setAlbums({ userId: MyUserId, id: "", title: ""});
        })
        .catch((error) => console.error("Error adding todo:", error));
    }
  };
  return (
    <>

      <div id="search">
      <input
          type="text"
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
      </div>
      <div id="add">
      <button onClick={() => setShowAddAlbums(!showAddAlbums)}>Add an album</button>
        {showAddAlbums && (
          <div>
            <input
              type="text"
              placeholder="Title"
              value={albums.title}
              onChange={(e) =>
                setAlbums((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <button onClick={handleAddAlbums}>Add</button>
          </div>
        )}
      </div>
      <div id="albums">
        <h1>Albums</h1>
        <ul>
          {filteredAlbum.map((alb) => (
            <li key={alb.id}>{alb.id}:
              <Link to={`/home/albums/${alb.id}`}>{alb.title}</Link>
            </li>
          ))}
        </ul>
        <Routes>
          <Route
            path=":albumId"
            element={<Photos />}
          />
        </Routes>
      </div>
    </>
  );
}
export default Albums;


function Photos() {
  const { albumId } = useParams();

  // all the usestate
  const [photosArray, setPhotosArray] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [photo, setPhoto] = useState({
    albumId: albumId,
    id: "",
    title: "",
    url: "",
    thumbnailUrl: ""
  });
  const [visiblePhotos, setVisiblePhotos] = useState(5);
  const [showAddPhoto, setShowAddPhotos] = useState(false);
  const [updatePhotoId, setUpdatePhotoId] = useState(null); 

  // fetch for photo
  useEffect(() => {
    if (albumId) {
      fetch(`http://localhost:3001/photos`)
        .then((response) => response.json())
        .then((data) => setAllPhotos(data))
        .catch((error) => console.error("Error fetching photos:", error));

      fetch(`http://localhost:3001/photos?albumId=${albumId}`)
        .then((response) => response.json())
        .then((data) => setPhotosArray(data))
        .catch((error) => console.error("Error fetching photos:", error));
    }
  }, [albumId]);

  // Handling photo
  const handlePhoto = (action, id) => {
    
    switch (action) {
      case "delete":
        fetch(`http://localhost:3001/photos/${id}`, {
          method: "DELETE",
        })
          .then(() => {
            setPhotosArray((prev) => prev.filter((t) => t.id !== id));
          })
          .catch((error) => console.error("Error deleting photo:", error));
        break;

      case "add":
        const newPhotoObj = {
          albumId: albumId,
          title: photo.title,
          url: photo.url,
          thumbnailUrl: photo.thumbnailUrl,
        };
        fetch("http://localhost:3001/photos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPhotoObj),
        })
          .then((response) => response.json())
          .then((data) => {
            setPhotosArray([data, ...photosArray]);
            setPhoto({ albumId: albumId, id: "", title: "", url: "", thumbnailUrl: "" });
          })
          .catch((error) => console.error("Error adding photo:", error));
        break;

      case "update":
        const updatedPhoto = photosArray.find((photo) => photo.id === id);
        fetch(`http://localhost:3001/photos/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPhoto),
        })
          .then((response) => response.json())
          .then((updated) => {
            setPhotosArray((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            );
            setUpdatePhotoId(null); 
          })
          .catch((error) => console.error("Error updating photo:", error));
        break;

      default:
        break;
    }
  };

  return (
    <div id="photos">
      <h1>Photos of album {albumId}</h1>
      <button onClick={() => setShowAddPhotos(!showAddPhoto)}>Add a photo</button>
      {showAddPhoto && (
        <div>
          <input
            type="text"
            placeholder="photo's title"
            value={photo.title}
            onChange={(e) =>
              setPhoto((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <input
            type="text"
            placeholder="photo's url"
            value={photo.thumbnailUrl}
            onChange={(e) =>
              setPhoto((prev) => ({ ...prev, thumbnailUrl: e.target.value }))
            }
          />
          <button onClick={() => handlePhoto("add", null)}>Add</button>
        </div>
      )}
      <ul>
        {photosArray.slice(0, visiblePhotos).map((currentphoto) => (
          <li>
            <img src={currentphoto.thumbnailUrl} style={{ width: "200px" }} />
            <p>{currentphoto.title}</p>
            <button onClick={() => handlePhoto("delete", currentphoto.id)}>Delete</button>
            <button onClick={() => setUpdatePhotoId(currentphoto.id)}>Update</button>
            {updatePhotoId === currentphoto.id && (
              <div>
                <input
                  type="text"
                  value={currentphoto.title}
                  onChange={(e) =>
                    setPhotosArray((prev) =>
                      prev.map((t) =>
                        t.id === currentphoto.id
                          ? { ...t, title: e.target.value }
                          : t
                      )
                    )
                  }
                />
                <button onClick={() => handlePhoto("update", currentphoto.id)}>Save</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {visiblePhotos < photosArray.length && (
        <button onClick={() => setVisiblePhotos((prev) => prev + 5)}>Recharge</button>
      )}
    </div>
  );
}