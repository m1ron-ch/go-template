import { API, BlockToolConstructorOptions, BlockTool } from '@editorjs/editorjs';

interface HistoryBlockData {
  year: string;
  shortDescription: string;
  fullDescription: string;
  additionalDetails: string[];
  showFullDescription: boolean;
}

class HistoryBlock implements BlockTool {
  data: HistoryBlockData;
  api: API;

  constructor({ data, api }: BlockToolConstructorOptions<HistoryBlockData>) {
    this.data = data;
    this.api = api;
  }

  static get toolbox() {
    return {
      title: 'History Block',
      icon: '<svg width="20" height="20"><path d="M10 20C15.52 20 20 15.52 20 10S15.52 0 10 0 0 4.48 0 10s4.48 10 10 10zm1-17h-2v6l5.25 3.15.75-1.23-4.5-2.67V3z"></path></svg>',
    };
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('history_block');

    const item = document.createElement('div');
    item.classList.add('history_item');

    const cover = document.createElement('div');
    cover.classList.add('history_cover');
    cover.contentEditable = 'true';
    cover.textContent = this.data.year || '1987';
    cover.dataset.placeholder = 'Enter year';

    item.appendChild(cover);

    const info = document.createElement('div');
    info.classList.add('history_info');

    const content = document.createElement('div');
    content.classList.add('history_content');

    const short = document.createElement('div');
    short.classList.add('history_short');
    short.contentEditable = 'true';
    short.innerHTML = this.data.shortDescription || 'Short description';
    short.dataset.placeholder = 'Enter short description';
    content.appendChild(short);

    const showFullDescriptionCheckbox = document.createElement('input');
    showFullDescriptionCheckbox.type = 'checkbox';
    showFullDescriptionCheckbox.checked = this.data.showFullDescription;
    showFullDescriptionCheckbox.addEventListener('change', (event) => {
      const checked = (event.target as HTMLInputElement).checked;
      full.style.display = checked ? 'block' : 'none';
      button.style.display = checked ? 'inline-block' : 'none';
      this.data.showFullDescription = checked;
    });

    content.appendChild(showFullDescriptionCheckbox);
    content.appendChild(document.createTextNode(' Enable full description'));

    const full = document.createElement('div');
    full.classList.add('history_full');
    full.contentEditable = 'true';
    full.innerHTML = this.data.fullDescription || 'Full description';
    full.style.display = this.data.showFullDescription ? 'block' : 'none';
    full.dataset.placeholder = 'Enter full description';
    content.appendChild(full);

    const additionalDetails = document.createElement('div');
    additionalDetails.classList.add('history_additional_details');
    (this.data.additionalDetails || []).forEach(detail => {
      const detailItem = document.createElement('div');
      detailItem.innerHTML = detail;
      detailItem.contentEditable = 'true';
      detailItem.dataset.placeholder = 'Enter detail';
      additionalDetails.appendChild(detailItem);
    });
    content.appendChild(additionalDetails);

    info.appendChild(content);
    item.appendChild(info);
    wrapper.appendChild(item);

    const button = document.createElement('button');
    button.classList.add('history_btn');
    button.textContent = 'Read more';
    button.style.display = this.data.showFullDescription ? 'inline-block' : 'none';
    button.addEventListener('click', () => {
      if (full.style.display === 'none') {
        full.style.display = 'block';
        button.textContent = 'Hide';
      } else {
        full.style.display = 'none';
        button.textContent = 'Read more';
      }
    });

    if (this.data.showFullDescription) {
      info.appendChild(button);
    }

    return wrapper;
  }

  save(blockContent: HTMLElement) {
    const year = (blockContent.querySelector('.history_cover') as HTMLElement).textContent || '';
    const shortDescription = (blockContent.querySelector('.history_short') as HTMLElement).innerHTML || '';
    const fullDescription = (blockContent.querySelector('.history_full') as HTMLElement).innerHTML || '';

    const additionalDetails: string[] = [];
    blockContent.querySelectorAll('.history_additional_details > div').forEach(detail => {
      additionalDetails.push(detail.innerHTML);
    });

    const showFullDescription = (blockContent.querySelector('input[type="checkbox"]') as HTMLInputElement).checked;

    return {
      year,
      shortDescription,
      fullDescription,
      additionalDetails,
      showFullDescription,
    };
  }
}

export default HistoryBlock;