import { SERVICE_STEPS } from "@/constants/landing";

export default function ServiceIntroSection() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-xl font-bold text-gray-900">
          Spotline은 이렇게 사용해요
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SERVICE_STEPS.map((step) => (
            <div
              key={step.step}
              className="rounded-xl bg-gray-50 p-6 text-center"
            >
              <div className="mb-3 text-4xl">{step.emoji}</div>
              <div className="mb-1 text-xs font-semibold text-blue-600">
                STEP {step.step}
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
