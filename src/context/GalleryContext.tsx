import React from 'react';
import axios from 'axios';


interface IGalleryContext {
    loading: boolean; 
    gallery: any;
    loadGallery: () => void;
};

export const GalleryContext = React.createContext({} as IGalleryContext);

type GalleryContextProviderProps = {
    children: any
};

export const GalleryContextProvider = ({children}:GalleryContextProviderProps) => {

    const [loading, setLoading] = React.useState(true);
    const [gallery, setGallery] = React.useState({});

    const DATA_PATH = "/data";

    const loadGallery = () => {
        axios.get(`${DATA_PATH}/gallery.json`).then((response:any) => {
            console.log(response)
            // gallery to json
            setGallery(response)
            setLoading(false)
        }).catch((error:any) => {
            console.log(error)
        })
    };
    return <GalleryContext.Provider value={{ loading, gallery, loadGallery}}>
        {children}
    </GalleryContext.Provider>
};
