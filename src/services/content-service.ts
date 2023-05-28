// import axios from "axios";
import { allImages } from "../assets/assets";

class ContentService {
  
  /*
  readonly DATA_PATH: string = "/data";
  loadGallery = () => {
    axios
      .get(`${this.DATA_PATH}/gallery.json`)
      .then((response: any) => {
        console.log(response);
        return response;
      })
      .catch((error: any) => {
        console.log(error);
      });
  };
  */

  getAllImages = () => {
    return allImages;
  };
}

export default ContentService;
