import { Action, AnyAction } from "redux";
import { AsyncState, createAsyncActionCreators, createAsyncActionTypes, createSessionAsyncReducer } from "../../../../redux/async";
import { IReducerActionsHandlerMap } from "../../../../redux/reducerFactory";
import moduleConfig from "../../moduleConfig";

// State

export interface INotifFilterSettings { [type: string]: boolean; }

export type INotifFilterSettings_State_Data = INotifFilterSettings;
export type INotifFilterSettings_State = AsyncState<INotifFilterSettings_State_Data>;

// Reducer

const initialState: INotifFilterSettings = {};

export const actionTypes = {
    ...createAsyncActionTypes(moduleConfig.namespaceActionType("NOTIFICATION_SETTINGS")),
    put: moduleConfig.namespaceActionType("NOTIFICATION_SETTINGS_UPDATED"),
    setRequest: moduleConfig.namespaceActionType("NOTIFICATION_FILTERS_SET_REQUEST"),
    setReceipt: moduleConfig.namespaceActionType("NOTIFICATION_FILTERS_SET_RECEIPT"),
    setError: moduleConfig.namespaceActionType("NOTIFICATION_FILTERS_SET_ERROR")
};
export const actions = {
    ...createAsyncActionCreators<INotifFilterSettings>(actionTypes),
    put: (data: INotifFilterSettings) => ({ type: actionTypes.put, data }),
    setRequest: (selectedFilters: INotifFilterSettings) => ({ type: actionTypes.setRequest, selectedFilters }),
    setReceipt: (selectedFilters: INotifFilterSettings) => ({ type: actionTypes.setReceipt, selectedFilters }),
    setError: (selectedFilters: INotifFilterSettings) => ({ type: actionTypes.setError, selectedFilters })
};

const actionsHandlerMap: IReducerActionsHandlerMap<INotifFilterSettings_State_Data> = {
    [actionTypes.put]: (s, a) => {
        const action = a as Action & { data: INotifFilterSettings };
        return { ...s, ...action.data };
    },
    [actionTypes.setRequest]: s => s,
    [actionTypes.setReceipt]: (s, a) => {
        const action = a as Action & { selectedFilters: INotifFilterSettings };
        return { ...s, ...action.selectedFilters };
    },
    [actionTypes.setError]: s => s
}

export default createSessionAsyncReducer(initialState, actionTypes, actionsHandlerMap);

// Getters