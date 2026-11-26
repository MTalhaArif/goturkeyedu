"use client";
export default function PrintButton({ style }) {
  return <button type="button" onClick={() => window.print()} style={style}>Yazdır / Print</button>;
}
