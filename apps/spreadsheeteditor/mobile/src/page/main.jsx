import React, { Component, Fragment, createContext } from 'react';
import { Page, View, Navbar, Subnavbar, Icon, f7 } from 'framework7-react';
import { observer, inject } from "mobx-react";
import { Device } from '../../../../common/mobile/utils/device';
import CollaborationView from '../../../../common/mobile/lib/view/collaboration/Collaboration.jsx'
import CellEditor from '../controller/CellEditor';
import { Statusbar } from '../controller/Statusbar';
import FilterOptionsController from '../controller/FilterOptions.jsx'
import { Search, SearchSettings } from '../controller/Search';
import { FunctionGroups } from "../controller/add/AddFunction";
import ContextMenu from '../controller/ContextMenu';
import { Toolbar } from "../controller/Toolbar";
import { AddLinkController } from '../controller/add/AddLink';
import { EditLinkController } from '../controller/edit/EditLink';
import SettingsController from '../controller/settings/Settings';
import AddingController from '../controller/add/Add';
import EditView from '../view/edit/Edit';
import VersionHistoryController from '../../../../common/mobile/lib/controller/VersionHistory';

export const MainContext = createContext();

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editOptionsVisible: false,
            addOptionsVisible: false,
            addShowOptions: null,
            settingsVisible: false,
            collaborationVisible: false,
            addLinkSettingsVisible: false,
            editLinkSettingsVisible: false,
            isOpenModal: false
        };
    }

    handleClickToOpenOptions = (opts, showOpts) => {
        f7.popover.close('.document-menu.modal-in', false);

        let opened = false;
        const newState = {};
        
        if ( opts === 'edit' ) {
            this.state.editOptionsVisible && (opened = true);
            newState.editOptionsVisible = true;
            newState.isOpenModal = true;
        } else if ( opts === 'add' ) {
            this.state.addOptionsVisible && (opened = true);
            newState.addOptionsVisible = true;
            newState.addShowOptions = showOpts;
            newState.isOpenModal = true;
        } else if ( opts === 'settings' ) {
            this.state.settingsVisible && (opened = true);
            newState.settingsVisible = true;
            newState.isOpenModal = true;
        } else if ( opts === 'coauth' ) {
            this.state.collaborationVisible && (opened = true);
            newState.collaborationVisible = true;
            newState.isOpenModal = true;
        } else if ( opts === 'add-link') {
            this.state.addLinkSettingsVisible && (opened = true);
            newState.addLinkSettingsVisible = true;
        } else if( opts === 'edit-link') {
            this.state.editLinkSettingsVisible && (opened = true);
            newState.editLinkSettingsVisible = true;
        } else if (opts === 'history') {
            newState.historyVisible = true;
        }

        for (let key in this.state) {
            if (this.state[key] && !opened) {
                setTimeout(() => {
                    this.handleClickToOpenOptions(opts, showOpts);
                }, 10);
                return;
            }
        }

        if (!opened) {
            this.setState(newState);
            if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
                f7.navbar.hide('.main-navbar');
            }
        }
    };

    handleOptionsViewClosed = opts => {
        this.setState(state => {
            if ( opts == 'edit' )
                return {editOptionsVisible: false, isOpenModal: false};
            else if ( opts == 'add' )
                return {addOptionsVisible: false, addShowOptions: null, isOpenModal: false};
            else if ( opts == 'settings' )
                return {settingsVisible: false, isOpenModal: false};
            else if ( opts == 'coauth' )
                return {collaborationVisible: false, isOpenModal: false};
            else if ( opts === 'add-link') 
                return {addLinkSettingsVisible: false};
            else if( opts === 'edit-link') 
                return {editLinkSettingsVisible: false};
            else if (opts === 'history')
                return {historyVisible: false}
        });

        if ((opts === 'edit' || opts === 'coauth') && Device.phone) {
            f7.navbar.show('.main-navbar');
        }
    };

    render() {
        const appOptions = this.props.storeAppOptions;
        const storeWorksheets = this.props.storeWorksheets;
        const wsProps = storeWorksheets.wsProps;
        const wsLock = storeWorksheets.wsLock;
        const config = appOptions.config;
        const isShowPlaceholder = !appOptions.isDocReady && (!config.customization || !(config.customization.loaderName || config.customization.loaderLogo));

        let isHideLogo = true,
            isCustomization = true,
            isBranding = true;

        if (!appOptions.isDisconnected && config?.customization) {
            isCustomization = !!(config.customization && (config.customization.loaderName || config.customization.loaderLogo));
            isBranding = appOptions.canBranding || appOptions.canBrandingExt;

            if (!Object.keys(config).length) {
                isCustomization = !/&(?:logo)=/.test(window.location.search);
            }

            isHideLogo = isCustomization && isBranding; 
        }

        if ($$('.skl-container').length) {
            $$('.skl-container').remove();
        }

        return (
            <MainContext.Provider value={{
                openOptions: this.handleClickToOpenOptions.bind(this),
                closeOptions: this.handleOptionsViewClosed.bind(this),
                showOptions: this.state.addShowOptions,
                wsLock,
                wsProps
            }}>
                <Page name="home" className={`editor${!isHideLogo ? ' page-with-logo' : ''}`}>
                    {/* Top Navbar */}
                    <Navbar id='editor-navbar' className={`main-navbar${!isHideLogo ? ' navbar-with-logo' : ''}`}>
                        {!isHideLogo && 
                            <div className="main-logo" onClick={() => {
                                window.open(`${__PUBLISHER_URL__}`, "_blank");
                            }}>
                                <Icon icon="icon-logo"></Icon>
                            </div>
                        }
                        <Subnavbar>
                            <Toolbar 
                                openOptions={this.handleClickToOpenOptions}
                                closeOptions={this.handleOptionsViewClosed}
                                isOpenModal={this.state.isOpenModal}
                            />
                            <Search useSuspense={false}/>
                        </Subnavbar>
                    </Navbar>
                
                    <CellEditor onClickToOpenAddOptions={(panels, button) => this.handleClickToOpenOptions('add', {panels: panels, button: button})} />
                    {/* Page content */}
                    <View id="editor_sdk" />
                    {isShowPlaceholder ?
                        <div className="doc-placeholder">
                            <div className="columns"></div>
                            <div className="columns"></div>
                        </div> :
                        null
                    }
                    <SearchSettings useSuspense={false} />
                    {!this.state.editOptionsVisible ? null : <EditView />}
                    {!this.state.addOptionsVisible ? null :
                        <AddingController
                            showOptions={this.state.addShowOptions} 
                        />
                    }
                    {!this.state.addLinkSettingsVisible ? null :
                        <AddLinkController 
                            closeOptions={this.handleOptionsViewClosed.bind(this)}
                        />
                    }
                    {!this.state.editLinkSettingsVisible ? null :
                        <EditLinkController 
                            closeOptions={this.handleOptionsViewClosed.bind(this)} 
                        />
                    }
                    {!this.state.settingsVisible ? null : <SettingsController />}
                    {!this.state.collaborationVisible ? null :
                        <CollaborationView  
                            closeOptions={this.handleOptionsViewClosed.bind(this)} 
                        />
                    }
                    {!this.state.historyVisible ? null :
                        <VersionHistoryController onclosed={this.handleOptionsViewClosed.bind(this, 'history')} />
                    }
                    {appOptions.isDocReady &&
                        <Fragment key='filter-context'>
                            <FilterOptionsController wsProps={wsProps} />
                            <ContextMenu 
                                openOptions={this.handleClickToOpenOptions.bind(this)} 
                            />
                        </Fragment>
                    }
                    <Statusbar key='statusbar'/>
                    <FunctionGroups /> {/* hidden component*/}
                </Page>
            </MainContext.Provider>
        )
    }
}

export default inject("storeAppOptions", "storeWorksheets")(observer(MainPage));