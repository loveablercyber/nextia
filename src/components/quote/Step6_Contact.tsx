import type { QuoteFormData } from '../../data/quoteCalculator';

interface Step6Props {
  formData: QuoteFormData;
  updateField: <K extends keyof QuoteFormData>(field: K, value: QuoteFormData[K]) => void;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9] focus:border-transparent text-sm transition-all";

export default function Step6_Contact({ formData, updateField }: Step6Props) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
        Quase lá! Seus dados de contato
      </h2>
      <p className="text-gray-500 mb-8">
        Enviaremos a estimativa detalhada para você. Seus dados são tratados com total privacidade.
      </p>

      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="q-name" label="Nome completo" required>
            <input
              id="q-name"
              type="text"
              placeholder="João da Silva"
              value={formData.name}
              onChange={e => updateField('name', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field id="q-company" label="Empresa / Negócio">
            <input
              id="q-company"
              type="text"
              placeholder="Restaurante Sabor & Arte"
              value={formData.company}
              onChange={e => updateField('company', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="q-whatsapp" label="WhatsApp" required>
            <input
              id="q-whatsapp"
              type="tel"
              placeholder="(14) 99640-5496"
              value={formData.whatsapp}
              onChange={e => updateField('whatsapp', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field id="q-email" label="E-mail" required>
            <input
              id="q-email"
              type="email"
              placeholder="joao@empresa.com.br"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field id="q-city" label="Cidade">
          <input
            id="q-city"
            type="text"
            placeholder="São Paulo, SP"
            value={formData.city}
            onChange={e => updateField('city', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id="q-notes" label="Observações adicionais">
          <textarea
            id="q-notes"
            rows={4}
            placeholder="Conte mais sobre seu projeto, referências, necessidades específicas..."
            value={formData.notes}
            onChange={e => updateField('notes', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>

        {/* Privacy note */}
        <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
          <span className="text-green-500 mt-0.5">🔒</span>
          <div className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">Seus dados estão seguros.</span>{' '}
            Utilizamos suas informações apenas para enviar a estimativa e entrar em contato. Nunca compartilhamos com terceiros.
          </div>
        </div>
      </div>
    </div>
  );
}
