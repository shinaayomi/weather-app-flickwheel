"use client";

import Container from "@/components/Container";
import ForcastWeatherDetail from "@/components/ForcastWeatherDetail";
import Navbar from "@/components/Navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import convertKelvinToCelsius from "@/utils/convertKelvinToCelsius";
import convertWindSpeed from "@/utils/convertWindSpeed";
import getDayOrNightIcon from "@/utils/getDayOrNightIcon";
import metersToKilometers from "@/utils/metersToKilometers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";

// http://api.openweathermap.org/data/2.5/forecast?q=${place}&appid={API_KEY}&cnt=56
// http://api.openweathermap.org/data/2.5/forecast?q=lagos&appid=54e89a5ba0c37f2d395fd7f322993b9c&cnt=56

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);

  const { isPending, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ["repoData"],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    },
    // fetch('http://api.openweathermap.org/data/2.5/forecast?q=lagos&appid=54e89a5ba0c37f2d395fd7f322993b9c&cnt=56').then((res) =>
    //   res.json(),
    // ),
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];
  console.log("data", data);

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  // Filtering data to get the first entry after 6 AM for each unique date
  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isPending)
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <p className="animate-bounce">Loading...</p>
      </div>
    );

  if (error) return "An error has occurred: " + error.message;
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingCity ? (
          ""
        ) : (
          <>
            {" "}
            {/* Today data */}
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end">
                  <p>{format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}</p>
                  <p className="text-lg">
                    ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yy")})
                  </p>
                </h2>

                <Container className="gap-10 px-6 items-center">
                  {/* temperature */}
                  <div className="flex flex-col px-4">
                    <span className="text-5xl">
                      {convertKelvinToCelsius(firstData?.main.temp ?? 0)}º
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span>Feels like</span>
                      <span>
                        {convertKelvinToCelsius(
                          firstData?.main.feels_like ?? 0
                        )}
                        º↓
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}
                        º↓
                      </span>
                      <span>
                        {convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}
                        º↑
                      </span>
                    </p>
                  </div>
                  {/* time and weather icon */}
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {data.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                      >
                        <p className="whitespace-nowrap">
                          {format(parseISO(d.dt_txt), "h:mm a")}
                        </p>
                        {/* <WeatherIcon iconName={d.weather[0].icon} /> */}
                        <WeatherIcon
                          iconName={getDayOrNightIcon(
                            d.weather[0].icon,
                            d.dt_txt
                          )}
                        />
                        <p>
                          {convertKelvinToCelsius(firstData?.main.temp ?? 0)}º
                        </p>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>
              <div className="flex gap-4">
                {/* left */}
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <p className="capitalize text-center">
                    {firstData?.weather[0].description}
                  </p>
                  <WeatherIcon
                    iconName={getDayOrNightIcon(
                      firstData?.weather[0].icon ?? "",
                      firstData?.dt_txt ?? ""
                    )}
                  />
                </Container>
                <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails
                    visability={metersToKilometers(
                      firstData?.visibility ?? 10000
                    )}
                    humidity={`${firstData?.main.humidity}%`}
                    airPressure={`${firstData?.main.pressure} hPa`}
                    sunrise={format(
                      fromUnixTime(data.city.sunrise ?? 1710654629),
                      "H:mm"
                    )}
                    sunset={format(
                      fromUnixTime(data.city.sunset ?? 1710698165),
                      "H:mm"
                    )}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 4.69)}
                  />
                </Container>
                {/* right */}
              </div>
            </section>
            {/* 7 days data */}
            <section className="flex w-full flex-col gap-4">
              <p className="text-2xl ">Forcast (7 days)</p>
              {firstDataForEachDate.map((d, i) => (
                <ForcastWeatherDetail
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? "Old"}
                  date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
                  day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  airPressure={`${d?.main.pressure} hPa`}
                  humidity={`${d?.main.humidity}%`}
                  sunrise={format(
                    fromUnixTime(data.city.sunrise ?? 1710654629),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data.city.sunset ?? 1710698165),
                    "H:mm"
                  )}
                  visability={metersToKilometers(d?.visibility ?? 10000)}
                  windSpeed={convertWindSpeed(d?.wind.speed ?? 4.69)}
                />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
