import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { fillUserData } from "../../infra/Me";
import { excludeTypes, fillData } from "./dataTypes";
import { storedFilters } from "./storedFilters";

const writeTypesParams = availableApps => {
  let params = "";
  // console.log("available apps:", availableApps);
  for (const app in availableApps) {
    if (availableApps[app]) {
      params += "&type=" + app.toUpperCase();
    }
  }
  return params;
};

export const fetchTimeline = dispatch => async availableApps => {
  dispatch({
    type: "FETCH_TIMELINE"
  });

  try {
    // console.log("FETCH timeline");
    const news = await fetchJSONWithCache(
      `/timeline/lastNotifications?page=0&${writeTypesParams(availableApps)}`,
      {
        headers: {
          Accept: "application/json;version=2.0"
        }
      }
    );
    const results = news.results.filter(
      n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params
    );
    const newNews = await fillData(availableApps, results);

    if (newNews.length > 0) {
      dispatch({
        news: newNews,
        type: "FETCH_NEW_TIMELINE"
      });
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn(e);
  }
};

export const listTimeline = dispatch => async (
  page,
  availableApps,
  legalapps
) => {
  dispatch({
    type: "FETCH_TIMELINE"
  });

  // console.log("LIST timeline");

  let loading = true;

  setTimeout(() => {
    if (loading) {
      dispatch({
        type: "FAILED_LOAD_TIMELINE"
      });
    }
  }, 8000);

  try {
    await fillUserData();

    if (!availableApps) {
      availableApps = await storedFilters(legalapps);
      dispatch({
        availableApps,
        type: "FILTER_TIMELINE"
      });

      dispatch({
        selectedApps: availableApps,
        type: "PICK_FILTER_TIMELINE"
      });
    }

    const news = await fetchJSONWithCache(
      `/timeline/lastNotifications?page=${page}&${writeTypesParams(
        availableApps
      )}`,
      {
        headers: {
          Accept: "application/json;version=2.0"
        }
      }
    );
    const results = news.results.filter(
      n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params
    );
    const newNews = await fillData(availableApps, results);

    if (newNews.length > 0) {
      dispatch({
        news: newNews,
        type: "APPEND_TIMELINE"
      });
    } else {
      dispatch({
        type: "END_REACHED_TIMELINE"
      });
    }

    loading = false;
    return newNews;
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn(e);
    dispatch({
      type: "FAILED_LOAD_TIMELINE"
    });

    loading = false;
    return [];
  }
};
