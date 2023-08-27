import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import "./style.scss";
import { fetchDataFromApi } from "../../utils/api";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import Spinner from "../../pages/searchResult/spinner/Spinner";
import MovieCard from "./movieCard/MovieCard";

const SearchResult = () => {
  const [data, setData] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const { query } = useParams();

  const fetchInitialData = () => {
    setLoading(true);
    fetchDataFromApi(`/search/multi?query=${query}&page=${1}`).then((res) => {
      setData(res);
      setPageNum(2); // Start from page 2 for next fetching
      setLoading(false);
    });
  };
  
  const fetchNextPageData = () => {
    fetchDataFromApi(`/search/multi?query=${query}&page=${pageNum}`).then((res) => {
      if (data?.results) {
        setData((prevData) => ({
          ...prevData,
          results: [...prevData.results, ...res.results],
        }));
      } else {
        setData(res);
      }
      setPageNum((prevPageNum) => prevPageNum + 1);
    });
  };
  
  useEffect(() => {
    setPageNum(1);
    fetchInitialData();
  }, [query]);

  return (
    <div className="searchResultsPage">
      {loading && <Spinner initial={true} />}
      {!loading && (
        <ContentWrapper>
          {data && data?.results.length > 0 ? (
            <>
              <div className="pageTitle">
                {`Search ${
                  data?.total_results > 1 ? "results" : "result"
                } of '${query}'`}
              </div>
              <InfiniteScroll
                  className="content"
                  dataLength={data?.results.length || 0}
                  next={fetchNextPageData}
                  hasMore={pageNum <= data?.total_pages}
                  loader={<Spinner />}
>
                {data?.results.map((item, index) => {
                  if (item.media_type === "person") return;
                  return (
                    <MovieCard key={index} data={item} fromSearch={true} />
                  );
                })}
              </InfiniteScroll>
            </>
          ) : (
            <span className="resultNotFound">
              No result found for your search term : "{query}"
            </span>
          )}
        </ContentWrapper>
      )}
    </div>
  );
};

export default SearchResult;
