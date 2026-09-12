import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export type ExpandableItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

/** "Why does this work? +" — keeps prose out of the way until it is wanted. */
export function Expandable({ items }: { items: ExpandableItem[] }) {
  if (items.length === 0) return null;

  return (
    <Accordion type="multiple" className="border-t border-border">
      {items.map((it) => (
        <AccordionItem key={it.id} value={it.id}>
          <AccordionTrigger>{it.label}</AccordionTrigger>
          <AccordionContent>{it.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
