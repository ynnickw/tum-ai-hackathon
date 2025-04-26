import { Button as UIButton } from "@/components/ui/button";

export default function Button({ icon, children, onClick, className }) {
  return (
    <UIButton
      variant="default"
      className={className}
      onClick={onClick}
    >
      {icon}
      {children}
    </UIButton>
  );
}
