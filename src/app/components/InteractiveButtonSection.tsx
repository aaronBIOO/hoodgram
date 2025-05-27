"use client";   

import React from 'react';
import Button from '@/app/components/Button'; 

export default function InteractiveButtonSection() {
  const handleClick = () => {
    alert('Button clicked from Client Component!');
  };

  return (
    <Button onClick={handleClick}>
      Click Me (from Client Component)
    </Button>
  );
}