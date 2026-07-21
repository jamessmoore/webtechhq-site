import { describe, it, expect } from "vitest";
import { getOrganizationJsonLd, getPersonJsonLd, getServiceJsonLd, getFaqJsonLd, SOCIAL_LINKS } from "../../../src/lib/structuredData";

describe("getOrganizationJsonLd()", () => {
  const org = getOrganizationJsonLd();

  it("identifies Moore Solutions as an Organization", () => {
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("Moore Solutions");
    expect(org.url).toBe("https://webtechhq.com");
  });

  it("links every known social profile", () => {
    expect(org.sameAs).toEqual(SOCIAL_LINKS);
  });
});

describe("getPersonJsonLd()", () => {
  const person = getPersonJsonLd();

  it("identifies James Moore as a Person founding Moore Solutions", () => {
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("James S. Moore");
    expect(person.worksFor.name).toBe("Moore Solutions");
  });

  it("links every known social profile", () => {
    expect(person.sameAs).toEqual(SOCIAL_LINKS);
  });
});

describe("getServiceJsonLd()", () => {
  const services = [
    { id: "a", title: "SERVICE A", content: "Does A things." },
    { id: "b", title: "SERVICE B", content: "Does B things." },
  ];
  const jsonLd = getServiceJsonLd(services);

  it("builds one Service entry per input service, in order", () => {
    expect(jsonLd["@type"]).toBe("ItemList");
    expect(jsonLd.itemListElement).toHaveLength(2);
    expect(jsonLd.itemListElement[0].name).toBe("SERVICE A");
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[1].name).toBe("SERVICE B");
    expect(jsonLd.itemListElement[1].position).toBe(2);
  });

  it("points each service at the same provider", () => {
    for (const item of jsonLd.itemListElement) {
      expect(item.provider.name).toBe("Moore Solutions");
    }
  });
});

describe("getFaqJsonLd()", () => {
  const faqs = [
    { question: "Question A?", answer: "Answer A." },
    { question: "Question B?", answer: "Answer B." },
  ];
  const jsonLd = getFaqJsonLd(faqs);

  it("builds a schema.org FAQPage with one Question per input, in order", () => {
    expect(jsonLd["@type"]).toBe("FAQPage");
    expect(jsonLd.mainEntity).toHaveLength(2);
    expect(jsonLd.mainEntity[0]["@type"]).toBe("Question");
    expect(jsonLd.mainEntity[0].name).toBe("Question A?");
    expect(jsonLd.mainEntity[1].name).toBe("Question B?");
  });

  it("nests each answer as an acceptedAnswer", () => {
    for (const [i, item] of jsonLd.mainEntity.entries()) {
      expect(item.acceptedAnswer["@type"]).toBe("Answer");
      expect(item.acceptedAnswer.text).toBe(faqs[i].answer);
    }
  });
});
