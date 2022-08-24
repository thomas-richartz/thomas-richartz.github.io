/** @jsxImportSource @emotion/react */

import { bottomBarStyle } from "../styles";

interface BottomBarProps {
    onNavigate: (screen:string) => void;
}

export const BottomBar = ({onNavigate}:BottomBarProps): JSX.Element => {

    return <><div css={bottomBarStyle}>
        <span css={{
            border: 0,
            color:'#666',
            background: 'none',
            boxShadow: 'none',
            borderRadius: '0px',
            fontSize: '1.2em',
            marginLeft: '1vw',
            '&:hover,&:focus' : {
                color:'#999',
            }
        }} > &copy; Thomas Richartz 2022</span>
        <button css={{
            border: 0,
            color:'#fff',
            background: 'none',
            boxShadow: 'none',
            borderRadius: '0px',
            alignSelf:'center',
            margin: 'auto',
            marginLeft: '33vw',
            fontSize: '1.8em',
        }}  onClick={() => onNavigate("gallery")}>⌂</button>
    </div>
    </>

};

