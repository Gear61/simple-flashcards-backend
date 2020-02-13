import React from 'react';
import HomeIcon from 'react-ionicons/lib/MdHome.js';
import DownloadIcon from 'react-ionicons/lib/MdDownload.js';
import AddCircle from 'react-ionicons/lib/MdAddCircle';
import MinusCircle from 'react-ionicons/lib/MdCloseCircle';
import FolderIcon from 'react-ionicons/lib/MdFolder';
import SettingsIcon from 'react-ionicons/lib/MdSettings';

export default function Navigation(props) {
    return <div className="navigation">
        <HomeIcon />
        <DownloadIcon />
        <AddCircle />
        <MinusCircle />
        <FolderIcon />
        <SettingsIcon />
    </div>;
}