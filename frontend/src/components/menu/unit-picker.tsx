"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function UnitPicker() {
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

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
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <Button key={id} onClick={() => handleClick(id)}>
              {id}
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
