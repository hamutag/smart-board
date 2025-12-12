import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Settings from "./Settings";

import Announcements from "./Announcements";

import Board from "./Board";

import Halachot from "./Halachot";

import DesignSettings from "./DesignSettings";

import Shabbat from "./Shabbat";

import LeiluyNishmatAdmin from "./LeiluyNishmatAdmin";

import BulkImport from "./BulkImport";

import UpdateHebrewDates from "./UpdateHebrewDates";

import UpdateZmanim from "./UpdateZmanim";

import RefuahShelemaAdmin from "./RefuahShelemaAdmin";

import BrachotAdmin from "./BrachotAdmin";

import FullEditor from "./FullEditor";

import SingleDayZmanimEditor from "./SingleDayZmanimEditor";

import HalachotImport from "./HalachotImport";

import SmartMessagesAdmin from "./SmartMessagesAdmin";

import ShabbatTimesEditor from "./ShabbatTimesEditor";

import CommunityAdmin from "./CommunityAdmin";

import CommunityPreview from "./CommunityPreview";

import NiftarimAdmin from "./NiftarimAdmin";

import BrachosBoard from "./BrachosBoard";

import ShabbatTimesPreview from "./ShabbatTimesPreview";

import CountdownPreview from "./CountdownPreview";

import SendYahrzeitReminders from "./SendYahrzeitReminders";

import CountdownSettingsPage from "./CountdownSettingsPage";

import SlideSettingsAdmin from "./SlideSettingsAdmin";

import ScheduleAdmin from "./ScheduleAdmin";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Settings: Settings,
    
    Announcements: Announcements,
    
    Board: Board,
    
    Halachot: Halachot,
    
    DesignSettings: DesignSettings,
    
    Shabbat: Shabbat,
    
    LeiluyNishmatAdmin: LeiluyNishmatAdmin,
    
    BulkImport: BulkImport,
    
    UpdateHebrewDates: UpdateHebrewDates,
    
    UpdateZmanim: UpdateZmanim,
    
    RefuahShelemaAdmin: RefuahShelemaAdmin,
    
    BrachotAdmin: BrachotAdmin,
    
    FullEditor: FullEditor,
    
    SingleDayZmanimEditor: SingleDayZmanimEditor,
    
    HalachotImport: HalachotImport,
    
    SmartMessagesAdmin: SmartMessagesAdmin,
    
    ShabbatTimesEditor: ShabbatTimesEditor,
    
    CommunityAdmin: CommunityAdmin,
    
    CommunityPreview: CommunityPreview,
    
    NiftarimAdmin: NiftarimAdmin,
    
    BrachosBoard: BrachosBoard,
    
    ShabbatTimesPreview: ShabbatTimesPreview,
    
    CountdownPreview: CountdownPreview,
    
    SendYahrzeitReminders: SendYahrzeitReminders,
    
    CountdownSettingsPage: CountdownSettingsPage,
    
    SlideSettingsAdmin: SlideSettingsAdmin,
    
    ScheduleAdmin: ScheduleAdmin,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Announcements" element={<Announcements />} />
                
                <Route path="/Board" element={<Board />} />
                
                <Route path="/Halachot" element={<Halachot />} />
                
                <Route path="/DesignSettings" element={<DesignSettings />} />
                
                <Route path="/Shabbat" element={<Shabbat />} />
                
                <Route path="/LeiluyNishmatAdmin" element={<LeiluyNishmatAdmin />} />
                
                <Route path="/BulkImport" element={<BulkImport />} />
                
                <Route path="/UpdateHebrewDates" element={<UpdateHebrewDates />} />
                
                <Route path="/UpdateZmanim" element={<UpdateZmanim />} />
                
                <Route path="/RefuahShelemaAdmin" element={<RefuahShelemaAdmin />} />
                
                <Route path="/BrachotAdmin" element={<BrachotAdmin />} />
                
                <Route path="/FullEditor" element={<FullEditor />} />
                
                <Route path="/SingleDayZmanimEditor" element={<SingleDayZmanimEditor />} />
                
                <Route path="/HalachotImport" element={<HalachotImport />} />
                
                <Route path="/SmartMessagesAdmin" element={<SmartMessagesAdmin />} />
                
                <Route path="/ShabbatTimesEditor" element={<ShabbatTimesEditor />} />
                
                <Route path="/CommunityAdmin" element={<CommunityAdmin />} />
                
                <Route path="/CommunityPreview" element={<CommunityPreview />} />
                
                <Route path="/NiftarimAdmin" element={<NiftarimAdmin />} />
                
                <Route path="/BrachosBoard" element={<BrachosBoard />} />
                
                <Route path="/ShabbatTimesPreview" element={<ShabbatTimesPreview />} />
                
                <Route path="/CountdownPreview" element={<CountdownPreview />} />
                
                <Route path="/SendYahrzeitReminders" element={<SendYahrzeitReminders />} />
                
                <Route path="/CountdownSettingsPage" element={<CountdownSettingsPage />} />
                
                <Route path="/SlideSettingsAdmin" element={<SlideSettingsAdmin />} />
                
                <Route path="/ScheduleAdmin" element={<ScheduleAdmin />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}