"use client";

import { useEffect, useState } from "react";
import { getAstronomyData } from "@/lib/actions";

interface AstronomyData {
  sun_altitude: number;
  sun_azimuth: number;
  moon_altitude: number;
  moon_azimuth: number;
  moon_phase: string;
  moon_illumination_percentage: string;
  sunrise: string;
  sunset: string;
}

interface Position {
  x: number;
  y: number;
}

export default function CelestialObject() {
  const [mounted, setMounted] = useState(false);
  const [astronomyData, setAstronomyData] = useState<AstronomyData | null>(
    null,
  );
  const [isNight, setIsNight] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchAstronomyData = async () => {
      try {
        const data = await getAstronomyData();
        setAstronomyData(data);

        // Determine if it's night time
        const currentTime = new Date();
        const sunsetTime = new Date();
        const sunriseTime = new Date();

        const [sunsetHour, sunsetMinute] = data.sunset.split(":");
        const [sunriseHour, sunriseMinute] = data.sunrise.split(":");

        sunsetTime.setHours(parseInt(sunsetHour), parseInt(sunsetMinute));
        sunriseTime.setHours(parseInt(sunriseHour), parseInt(sunriseMinute));

        setIsNight(currentTime > sunsetTime || currentTime < sunriseTime);
      } catch (error) {
        console.error("Error fetching astronomy data:", error);
      }
    };

    fetchAstronomyData();
    const interval = setInterval(fetchAstronomyData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !astronomyData) return;

    const ideElement = document.querySelector(
      "[data-ide-window]",
    ) as HTMLElement;
    if (!ideElement) return;

    const {
      sun_altitude,
      sun_azimuth,
      moon_altitude,
      moon_azimuth,
      moon_illumination_percentage,
    } = astronomyData;

    // Use moon data at night, sun data during day
    const altitude = isNight ? moon_altitude : sun_altitude;
    const azimuth = isNight ? moon_azimuth : sun_azimuth;

    // Calculate normalized position of light source relative to the window
    const lightX = -Math.sin((azimuth * Math.PI) / 180);
    const lightY = Math.cos((azimuth * Math.PI) / 180);

    // Shadow should be opposite to light source
    const shadowX = -lightX * 20; // 20px max offset
    const shadowY = -lightY * 20;

    // Calculate shadow intensity based on altitude
    const intensity = Math.max(
      0.05,
      Math.min(0.15, ((90 - Math.abs(altitude)) / 90) * 0.15),
    );

    // Set shadow color and opacity
    const shadowColor = isNight
      ? `rgba(255, 255, 255, ${intensity * (parseInt(moon_illumination_percentage) / 100)})`
      : `rgba(255, 215, 0, ${intensity})`;

    // Apply styles with transition
    ideElement.style.transition = "box-shadow 0.5s ease-in-out";
    ideElement.style.boxShadow = `${shadowX}px ${shadowY}px 30px ${shadowColor}`;
  }, [astronomyData, isNight, mounted]);

  useEffect(() => {
    if (!mounted || !astronomyData) return;

    const updatePosition = () => {
      const { sun_altitude, sun_azimuth, moon_altitude, moon_azimuth } =
        astronomyData;

      const altitude = isNight ? moon_altitude : sun_altitude;
      const azimuth = isNight ? moon_azimuth : sun_azimuth;

      // Convert astronomical coordinates to screen position
      // Invert the sin calculation to match natural movement (east to west)
      const x = -Math.sin((azimuth * Math.PI) / 180) * (90 - altitude);
      const y = Math.cos((azimuth * Math.PI) / 180) * (90 - altitude) * 0.5;

      setPosition({
        x: (x + 100) * (window.innerWidth / 200),
        y: (y + 40) * (window.innerHeight / 200),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [astronomyData, isNight, mounted]);

  if (!mounted || !astronomyData) return null;

  const celestialStyles = {
    position: "fixed" as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: isNight ? "50px" : "70px",
    height: isNight ? "50px" : "70px",
    borderRadius: "50%",
    backgroundColor: isNight ? "#ffffff" : "#ffd700",
    boxShadow: isNight
      ? `0 0 50px 20px rgba(255, 255, 255, ${
          parseInt(astronomyData.moon_illumination_percentage) / 100
        })`
      : "0 0 50px 20px rgba(255, 215, 0, 0.5)",
    zIndex: 0,
    pointerEvents: "none" as const,
  };

  return <div style={celestialStyles} />;
}
