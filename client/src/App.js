import React from "react";

import { ApiProxyConnector } from "@elastic/search-ui-elasticsearch-connector";
import { SearchProvider, SearchBox, Results } from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { v4 as uuidv4 } from "uuid";

const basePath = "http://localhost:3001/api";

const connector = new ApiProxyConnector({
  basePath,
});

const config = {
  onSearch: (requestState, queryConfig, next) => {
    requestState.requestId = uuidv4();
    return next(requestState, queryConfig);
  },
  onResultClick: (r) => {
    const payload = {
      application: "search-ui",
      action_name: "click",
      query_id: r.requestId || "",
      client_id: "getting_there",
      timestamp: new Date().toISOString(),
      message_type: "CLICK_THROUGH",
      message: `Clicked ${r.result.name.raw}`,
      user_query: r.query,
      event_attributes: {
        object: {
          object_id: r.result.id.raw,
          description: `${r.result.name.raw}(${r.result.release_date.raw}) by ${r.result.author.raw}`,
          position: {
            ordinal: r.resultIndexOnPage,
            page_depth: r.page,
          },
        },
      },
    };
    fetch(`${basePath}/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((r) => console.log(r))
      .catch((error) => {
        console.error("Error:", error);
      });
  },
  alwaysSearchOnInitialLoad: true,
  apiConnector: connector,
  debug: true,
  searchQuery: {
    search_fields: {
      name: {},
      author: {},
    },
    result_fields: {
      name: { raw: {} },
      author: { raw: {} },
      image_url: { raw: {} },
      url: { raw: {} },
      price: { raw: {} },
      release_date: { raw: {} },
    },
  },
};

export default function App() {
  return (
    <SearchProvider config={config}>
      <Layout
        header={<SearchBox autocompleteSuggestions={false} />}
        bodyContent={
          <Results
            titleField={"author"}
            urlField={"url"}
            thumbnailField={"image_url"}
            shouldTrackClickThrough={true}
          />
        }
      />
    </SearchProvider>
  );
}
