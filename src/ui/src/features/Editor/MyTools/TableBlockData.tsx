import { useState } from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import { createRoot } from 'react-dom/client';
import { BlockToolConstructorOptions } from '@editorjs/editorjs';

interface TableBlockData {
  rows: Array<{
    role: string;
    name: string;
    surname: string;
    patronymic: string;
    contacts: Array<{
      type: 'address' | 'phone' | 'email' | 'schedule';
      value: string;
    }>;
  }>;
}

const fields: Array<'surname' | 'name' | 'patronymic'> = ['surname', 'name', 'patronymic'];

const contactTypes = [
  { label: 'Address', value: 'address' },
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Schedule', value: 'schedule' },
];

class TableBlock {
  data: TableBlockData;
  wrapper: HTMLElement | null = null;
  modalContainer: HTMLElement | null = null;

  constructor({ data = {} }: BlockToolConstructorOptions<Partial<TableBlockData>>) {
    this.data = {
      rows: data.rows ?? [],
    };
  }

  static get toolbox() {
    return {
      title: 'Table',
      icon: '<svg width="20" height="20"><path d="..."></path></svg>',
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('table');

    const table = document.createElement('table');
    table.classList.add('table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.classList.add('table_head_row');
    headerRow.innerHTML = `
      <th>Должность</th>
      <th>ФИО</th>
      <th>Контакты</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    this.data.rows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.classList.add('table_row');

      const roleTd = document.createElement('td');
      const roleDiv = document.createElement('div');
      roleDiv.classList.add('leadership_role');
      roleDiv.contentEditable = 'true';
      roleDiv.innerText = row.role;
      roleDiv.addEventListener('input', () => {
        this.data.rows[rowIndex].role = roleDiv.innerText;
      });
      roleTd.appendChild(roleDiv);
      tr.appendChild(roleTd);

      const nameTd = document.createElement('td');
      const nameDiv = document.createElement('div');
      nameDiv.classList.add('leadership_title');
      fields.forEach((field, fieldIndex) => {
        const span = document.createElement('span');
        span.contentEditable = 'true';
        span.innerText = row[field];
        span.addEventListener('input', () => {
          this.data.rows[rowIndex][field] = span.innerText;
        });
        nameDiv.appendChild(span);
        if (fieldIndex < 2) nameDiv.appendChild(document.createTextNode(' '));
      });
      nameTd.appendChild(nameDiv);
      tr.appendChild(nameTd);

      const contactsTd = document.createElement('td');
      const contactsDiv = document.createElement('div');
      contactsDiv.classList.add('leadership_info_block');

      row.contacts.forEach((contact, contactIndex) => {
        const p = document.createElement('p');
        p.classList.add('leadership_info_item');

        let iconHtml = '';
        switch (contact.type) {
          case 'address':
            iconHtml = `<svg ...></svg>`;
            break;
          case 'phone':
            iconHtml = `<svg ...></svg>`;
            break;
          case 'email':
            iconHtml = `<svg ...></svg>`;
            break;
          case 'schedule':
            iconHtml = `<svg ...></svg>`;
            break;
        }

        const spanIcon = document.createElement('span');
        spanIcon.classList.add('leadership_info_icon');
        spanIcon.innerHTML = iconHtml;
        p.appendChild(spanIcon);

        const spanText = document.createElement('span');
        spanText.classList.add('leadership_info');
        spanText.contentEditable = 'true';
        spanText.innerText = contact.value;
        spanText.addEventListener('input', () => {
          this.data.rows[rowIndex].contacts[contactIndex].value = spanText.innerText;
        });
        p.appendChild(spanText);

        contactsDiv.appendChild(p);
      });

      contactsTd.appendChild(contactsDiv);
      tr.appendChild(contactsTd);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    this.wrapper.appendChild(table);

    const addButton = document.createElement('button');
    addButton.innerText = 'Add Row';
    addButton.addEventListener('click', () => this.showModal());
    this.wrapper.appendChild(addButton);

    // Create modal container
    this.modalContainer = document.createElement('div');
    this.wrapper.appendChild(this.modalContainer);

    return this.wrapper;
  }

  save(blockContent: HTMLElement) {
    const rows = Array.from(blockContent.querySelectorAll('tbody .table_row')).map(row => {
      const role = (row.querySelector('.leadership_role') as HTMLElement).textContent || '';
      const nameElements = row.querySelectorAll('.leadership_title span');
      const surname = nameElements[0]?.textContent || '';
      const name = nameElements[1]?.textContent || '';
      const patronymic = nameElements[2]?.textContent || '';

      const contacts = Array.from(row.querySelectorAll('.leadership_info_item')).map(contactItem => {
        const typeElement = contactItem.querySelector('.leadership_info_icon svg') as SVGElement;
        let type: 'address' | 'phone' | 'email' | 'schedule' = 'address';
        if (typeElement) {
          if (typeElement.classList.contains('phone')) type = 'phone';
          else if (typeElement.classList.contains('email')) type = 'email';
          else if (typeElement.classList.contains('schedule')) type = 'schedule';
        }
        const value = (contactItem.querySelector('.leadership_info') as HTMLElement).textContent || '';
        return { type, value };
      });

      return { role, surname, name, patronymic, contacts };
    });

    return { rows };
  }

  showModal() {
    if (this.modalContainer) {
      const ModalComponent = () => {
        const [visible, setVisible] = useState(true);
        const [form] = Form.useForm();

        const handleOk = () => {
          form.validateFields().then(values => {
            const newRow = {
              role: values.role,
              surname: values.surname,
              name: values.name,
              patronymic: values.patronymic,
              contacts: values.contacts.map((contact: { type: string; value: string }) => ({
                type: contact.type as 'address' | 'phone' | 'email' | 'schedule',
                value: contact.value,
              })),
            };
            this.data.rows.push(newRow);
            this.render();
            setVisible(false);
            root.unmount();
          });
        };

        const handleCancel = () => {
          setVisible(false);
          root.unmount();
        };

        return (
          <Modal
            title="Add New Row"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Form form={form} layout="vertical">
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="surname" label="Surname" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="patronymic" label="Patronymic" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.List name="contacts">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey }) => (
                      <div key={key} style={{ marginBottom: '8px' }}>
                        <Form.Item
                          name={[name, 'type']}
                          fieldKey={[fieldKey as number, 'type']}
                          rules={[{ required: true, message: 'Please select contact type' }]}
                          style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                        >
                          <Select placeholder="Select Contact Type">
                            {contactTypes.map(contact => (
                              <Select.Option key={contact.value} value={contact.value}>
                                {contact.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          name={[name, 'value']}
                          fieldKey={[fieldKey as number, 'value']}
                          rules={[{ required: true, message: 'Please enter contact value' }]}
                          style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
                        >
                          <Input placeholder="Enter Contact Value" />
                        </Form.Item>
                        <Button type="link" onClick={() => remove(name)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      Add Contact
                    </Button>
                  </>
                )}
              </Form.List>
            </Form>
          </Modal>
        );
      };

      const modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      this.modalContainer.appendChild(modalRoot);
      const root = createRoot(modalRoot);
      root.render(<ModalComponent />);
    }
  }
}

export default TableBlock;
