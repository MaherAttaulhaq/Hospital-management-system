import Image from "next/image";
import SwaggerUI from "swagger-ui-react";

export default function Home() {
  return (
    <div>
      <h1>main page</h1>
      <SwaggerUI url="/swagger.json" />
    </div>
  );
}
