import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { createLucideIcon, type LucideProps } from "lucide-react-upstream";
import {
  SiGithub,
  SiGooglechrome,
  SiInstagram,
  SiX,
  type IconType,
} from "@icons-pack/react-simple-icons";

export * from "lucide-react-upstream";

function fromSimpleIcons(name: string, Si: IconType) {
  const Brand = forwardRef<SVGSVGElement, LucideProps>(function Brand(props, ref) {
    const { size = 24, color = "currentColor", strokeWidth, absoluteStrokeWidth, ...rest } = props;
    return <Si ref={ref} size={size} color={color} {...(rest as ComponentPropsWithoutRef<IconType>)} />;
  });
  Brand.displayName = name;
  return Brand;
}

export const Github = fromSimpleIcons("Github", SiGithub);
export const Instagram = fromSimpleIcons("Instagram", SiInstagram);
export const Twitter = fromSimpleIcons("Twitter", SiX);
export const Chrome = fromSimpleIcons("Chrome", SiGooglechrome);
