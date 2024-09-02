import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { z } from "zod";
import Pagination from "./Pagination";
export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(90000000000);
  const [sortOption, setSortOption] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await axios.post("https://web-scraper-gxag.onrender.com/", {
          url: url || "https://www.jumia.com.ng",
        });
        if (res.data?.message) {
          toast.error("Error Enter a valid url");
          setData([]);
        } else {
          setData(res.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [url]);
  const jumiaUrlSchema = z
    .string()
    .url()
    .refine(
      (url) => {
        return url.includes("jumia.com");
      },
      {
        message: "URL must include the Jumia domain (e.g., jumia.com)",
      }
    );

  function handleSubmit(e) {
    e.preventDefault();

    const url = e.target[0].value;
    if (!url) return;

    try {
      jumiaUrlSchema.parse(url);
      setUrl(url);
    } catch (error) {
      const errorMessage = error.errors[0]?.message || "Invalid URL";
      toast.error(errorMessage);
    }
  }

  function handleFilter(e) {
    e.preventDefault();
    const min = e.target.min.value;
    const max = e.target.max.value;
    const sortOption = e.target.sortOption.value;
    if (min) {
      setMinPrice(parseInt(min));
    }
    if (max) {
      setMaxPrice(parseInt(max));
    }
    if (sortOption) {
      setSortOption(sortOption);
    }
  }
  const parsePrice = (priceString) => {
    return parseInt(priceString.replace(/[^0-9]/g, ""), 10);
  };

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data
    .filter((item) => {
      const price = parsePrice(item.price);

      return price >= minPrice && price <= maxPrice;
    })
    .sort((a, b) => {
      const priceA = parsePrice(a.price);
      const priceB = parsePrice(b.price);

      return sortOption === "asc" ? priceA - priceB : priceB - priceA;
    })
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(
    data
      .filter((item) => {
        const price = parsePrice(item.price);

        return price >= minPrice && price <= maxPrice;
      })
      .sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);

        return sortOption === "asc" ? priceA - priceB : priceB - priceA;
      }).length / itemsPerPage
  );

  return (
    <div className="container">
      <div className="">
        <section>
          <div className="cover">
            <form onSubmit={handleSubmit} className="inputContainer">
              <input type="search" placeholder="Enter Your Jumia Url" />
              <button>
                <CiSearch />
              </button>
            </form>
          </div>
          <div className="items">
            {loading ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                loading...
              </div>
            ) : (
              currentItems?.map((item, i) => (
                <div className="card" key={i}>
                  <div className="imgContainer">
                    <img
                      data-src={item.img.dataSrc}
                      src={item.img.src}
                      alt=""
                    />
                  </div>
                  <div className="details">
                    <a target="blank" href={item.link}>
                      {item.name}
                    </a>
                    <span>{item.price}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        <form className="filter" onSubmit={handleFilter}>
          <input type="number" name="min" placeholder="Min" />
          <input type="number" name="max" placeholder="Max" />
          <select name="sortOption" defaultValue={"asc"} id="">
            <option value="asc">Cheapest</option>
            <option value="desc">Expensive</option>
          </select>
          <button>
            <CiSearch />
          </button>
        </form>
        <Pagination
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>

      <Toaster />
    </div>
  );
}
