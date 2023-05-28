import clsx from "clsx";
import { RandomPictureViewer } from "../components/random-picture/viewer";
import { allImages } from "../assets/assets";

const LandingPage = () => {
  return (
    <>
      <div className="landingpage-wrap">
        <img
          className={clsx("page-image--center", "landingpage-image--profile")}
          src="/assets/img/page/thomas-richartz.jpg"
          alt={"thomas-richartz"}
        />
        <div className="page-headline">
          <h1>Thomas Richartz</h1>
        </div>
        <RandomPictureViewer images={allImages} />
      </div>
    </>
  );
};

export default LandingPage;
