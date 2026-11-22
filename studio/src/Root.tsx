import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { VIDEOS } from "./videos/liste";
export const Root: React.FC = () => (
  <>{VIDEOS.map((v) => <Composition key={v.id} id={v.id} component={v.component} durationInFrames={v.duree} fps={30} width={1080} height={1920} />)}</>
);
