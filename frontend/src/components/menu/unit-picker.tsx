"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function UnitPicker() {
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const units = await fetch("http://127.0.0.1:8000/api/units/");
      const data = await units.json();

      console.log(data);
      setUnits(data);
    };

    fetchData()
      .then(() => {
        console.log("Data fetched successfully");
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  units.map((unit) => {
    console.log(unit);
  });

  const handleClick = (id: number) => {
    if (id !== selectedUnit) {
      setSelectedUnit(id);
      setShowSideMenu(true);
    }
  };

  return (
    <main className="flex h-10/12 flex-col items-center justify-center">
      <div className="flex flex-row items-center justify-center gap-4">
        <Card className="flex flex-row flex-wrap p-12 w-[400px]">
          {units.map((unit) => (
            <Button key={unit[0]} onClick={() => handleClick(unit[0])}>
              {unit[1]}
            </Button>
          ))}
        </Card>
        {showSideMenu && selectedUnit !== null && (
          <div>
            <button
              type="button"
              onClick={() => {
                setShowSideMenu(false);
                setSelectedUnit(null);
              }}
            >
              X
            </button>
            <h1>Selected Unit: {selectedUnit}</h1>
            <p>Details for unit {selectedUnit}</p>
          </div>
        )}
      </div>
    </main>
  );
}
