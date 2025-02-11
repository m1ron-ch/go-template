import ReactDOM from 'react-dom/client';
import { BlockTool, API, BlockToolConstructorOptions } from '@editorjs/editorjs';
import ContactTable from './ContactTable';

type ContactData = {
  key: number;
  officeName?: string;
  address?: string;
  phone?: string[];
  fax?: string;
  email?: string;
  workingHours?: string[];
  latitude?: string;
  longitude?: string;
};

export type ContactTableData = {
  contacts: ContactData[];
};

class ContactTableTool implements BlockTool {
  data: ContactTableData;
  wrapper: HTMLElement;
  api: API;

  constructor({ data, api}: BlockToolConstructorOptions) {
    this.api = api;
    this.data = data || { contacts: [] };
    this.wrapper = document.createElement('div');
  }

  static get toolbox() {
    return {
      title: 'Contact Table',
      icon: '<svg>...</svg>',
    };
  }

  render() {
    const root = ReactDOM.createRoot(this.wrapper);
    root.render(
      <ContactTable
        data={this.data.contacts || []}
        onChange={(updatedData) => this.updateData(updatedData)}
      />
    );
    return this.wrapper;
  }

  save() {
    return this.data;
  }

  updateData(updatedData: ContactData[]) {
    this.data.contacts = updatedData;
  }

  static render({ data, lang }: { data: ContactTableData, lang: string }): string{
    const contacts = data.contacts

    const getLinkDetails = (lang: string): { prefix: string, texts: string[] } => {
      switch (lang) {
        case 'by':
          return { prefix: '/by', texts: ['Офісы і падраздзяленні', 'Кантактныя даныя', 'Бягучае месцазнаходжанне'] };
        case 'en':
          return { prefix: '/en', texts: ['Offices and divisions', 'Contact information', 'Current location'] };
        default:
          return { prefix: '', texts: ['Офисы и подразделения', 'Контактные данные', 'Текущее местоположение'] };
      }
    };
  
    const { prefix: _, texts: linkText } = getLinkDetails(lang);

    return `
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr class="table-head-row">
              <th>${linkText[0]}</th>
              <th>${linkText[1]}</th>
              <th>${linkText[2]}</th>
            </tr>
          </thead>
          <tbody>
            ${contacts
              .map(
                item => `
              <tr class="table-row">
                <td>
                  <div class="contact-table-title">${item.officeName}</div>
                </td>
                <td>
                  <div class="contact-table-info">
                    ${
                      item.address
                        ? `
                    <p class="contact-table-info-item">
                      <span class="contact-table-info-icon">
                        <!-- Адрес Icon SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M12.6727 1.61162 20.7999 9H17.8267L12 3.70302 6 9.15757V19.0001H11V21.0001H5C4.44772 21.0001 4 20.5524 4 20.0001V11.0001L1 11.0001 11.3273 1.61162C11.7087 1.26488 12.2913 1.26488 12.6727 1.61162ZM14 11H23V18H14V11ZM16 13V16H21V13H16ZM24 21H13V19H24V21Z"/>
                        </svg>
                      </span>
                      <span class="contact-table-text">${item.address}</span>
                    </p>`
                        : ''
                    }
                    ${
                      item.phone && item.phone.length > 0
                        ? item.phone
                            .map(
                              phone => `
                    <p class="contact-table-info-item">
                      <span class="contact-table-info-icon">
                        <!-- Телефон Icon SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M9.36556 10.6821C10.302 12.3288 11.6712 13.698 13.3179 14.6344L14.2024 13.3961C14.4965 12.9845 15.0516 12.8573 15.4956 13.0998C16.9024 13.8683 18.4571 14.3353 20.0789 14.4637C20.599 14.5049 21 14.9389 21 15.4606V19.9234C21 20.4361 20.6122 20.8657 20.1022 20.9181C19.5723 20.9726 19.0377 21 18.5 21C9.93959 21 3 14.0604 3 5.5C3 4.96227 3.02742 4.42771 3.08189 3.89776C3.1343 3.38775 3.56394 3 4.07665 3H8.53942C9.0611 3 9.49513 3.40104 9.5363 3.92109C9.66467 5.54288 10.1317 7.09764 10.9002 8.50444C11.1427 8.9484 11.0155 9.50354 10.6039 9.79757L9.36556 10.6821ZM6.84425 10.0252L8.7442 8.66809C8.20547 7.50514 7.83628 6.27183 7.64727 5H5.00907C5.00303 5.16632 5 5.333 5 5.5C5 12.9558 11.0442 19 18.5 19C18.667 19 18.8337 18.997 19 18.9909V16.3527C17.7282 16.1637 16.4949 15.7945 15.3319 15.2558L13.9748 17.1558C13.4258 16.9425 12.8956 16.6915 12.3874 16.4061L12.3293 16.373C10.3697 15.2587 8.74134 13.6303 7.627 11.6707L7.59394 11.6126C7.30849 11.1044 7.05754 10.5742 6.84425 10.0252Z"/>
                        </svg>
                      </span>
                      <span class="contact-table-text">
                        <a href="tel:${phone}">${phone}</a>
                      </span>
                    </p>`
                            )
                            .join('')
                        : ''
                    }
                    ${
                      item.fax
                        ? `
                    <p class="contact-table-info-item">
                      <span class="contact-table-info-icon">
                        <!-- Fax Icon SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor">
                          <path d="M493.268,84.611h-36.579V27.079c0-10.345-8.387-18.732-18.732-18.732h-235.97c-10.345,0-18.732,8.387-18.732,18.732v57.533H165.41c0-25.23-19.083-41.495-39.952-41.495H39.952C17.922,43.115,0,61.038,0,83.068v294.936c0,22.03,17.922,39.952,39.952,39.952h85.505c20.47,0,39.952-15.818,39.952-41.495h17.846v108.46c0,10.345,8.387,18.732,18.732,18.732h235.97c10.345,0,18.732-8.387,18.732-18.732v-108.46h36.579c10.345,0,18.732-8.387,18.732-18.732V103.343C512,92.998,503.613,84.611,493.268,84.611z M127.946,103.343c0,10.021,0,264.658,0,274.661c0,1.372-1.118,2.489-2.489,2.489H39.952c-1.372,0-2.489-1.116-2.489-2.489V83.068c0-1.372,1.118-2.489,2.489-2.489h85.505c1.372,0,2.489,1.116,2.489,2.489V103.343z M220.719,45.81h198.506v38.801H220.719V45.81z M419.226,466.19H220.719v-89.729h198.506V466.19z M474.537,338.996c-13.349,0-300.861,0-309.127,0V122.075c8.256,0,295.794,0,309.127,0V338.996z"/>
                          <path d="M227.659,196.283h184.628c10.345,0,18.732-8.387,18.732-18.732c-0.001-10.345-8.388-18.732-18.733-18.732H227.659c-10.345,0-18.732,8.387-18.732,18.732C208.927,187.896,217.314,196.283,227.659,196.283z"/>
                          <path d="M227.659,302.251c10.345,0,18.732-8.387,18.732-18.732v-40.774c0-10.345-8.387-18.732-18.732-18.732s-18.732,8.387-18.732,18.732v40.774C208.927,293.864,217.314,302.251,227.659,302.251z"/>
                          <path d="M289.201,224.014c-10.345,0-18.732,8.387-18.732,18.732v40.774c0,10.345,8.387,18.732,18.732,18.732c10.345,0,18.732-8.387,18.732-18.732v-40.774C307.933,232.401,299.546,224.014,289.201,224.014z"/>
                          <path d="M350.744,224.014c-10.345,0-18.732,8.387-18.732,18.732v40.774c0,10.345,8.387,18.732,18.732,18.732s18.732-8.387,18.732-18.732v-40.774C369.475,232.401,361.089,224.014,350.744,224.014z"/>
                          <path d="M412.286,224.014c-10.345,0-18.732,8.387-18.732,18.732v40.774c0,10.345,8.387,18.732,18.732,18.732s18.732-8.387,18.732-18.732v-40.774C431.018,232.401,422.631,224.014,412.286,224.014z"/>
                          <path d="M289.553,440.057h60.838c10.345,0,18.732-8.387,18.732-18.732c0-10.345-8.387-18.732-18.732-18.732h-60.838c-10.345,0-18.732,8.387-18.732,18.732C270.822,431.67,279.209,440.057,289.553,440.057z"/>
                        </g>
                      </svg>
                      </span>
                      <span class="contact-table-text">
                        ${item.fax}
                      </span>
                    </p>`
                        : ''
                    }
                    ${
                      item.email
                        ? `
                    <p class="contact-table-info-item">
                      <span class="contact-table-info-icon">
                        <!-- Email Icon SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M21 3C21.5523 3 22 3.44772 22 4V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V19H20V7.3L12 14.5L2 5.5V4C2 3.44772 2.44772 3 3 3H21ZM8 15V17H0V15H8ZM5 10V12H0V10H5ZM19.5659 5H4.43414L12 11.8093L19.5659 5Z"/>
                        </svg>
                      </span>
                      <span class="contact-table-text">
                        <a href="mailto:${item.email}">${item.email}</a>
                      </span>
                    </p>`
                        : ''
                    }
                    ${
                      item.workingHours && item.workingHours.length > 0
                        ? `
                    <p class="contact-table-info-item">
                      <span class="contact-table-info-icon">
                        <!-- Рабочие часы Icon SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM8 13V15H6V13H8ZM13 13V15H11V13H13ZM18 13V15H16V13H18ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"/>
                        </svg>
                      </span>
                      <span class="contact-table-info-group">
                        ${item.workingHours
                          .map(hour => `<span class="contact-table-text">${hour}</span>`)
                          .join('')}
                      </span>
                    </p>`
                        : ''
                    }
                  </div>
                </td>
                <td>
                  <div class="contact-table-map">
                    <button
                      class="map-link contact-table-map-control"
                      data-lat="${item?.latitude || ''}"
                      data-lng="${item?.longitude || ''}"
                      data-title="${item.address || ''}"
                      aria-label="Кнопка открытия карты"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }
}

export const contactRender = (block: { data: ContactTableData }, lang: string) =>
  ContactTableTool.render({ data: block.data, lang: lang });

export default ContactTableTool;
