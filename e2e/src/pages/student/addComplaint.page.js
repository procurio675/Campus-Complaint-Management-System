/**
 * Add Complaint Page
 * Only locators + primitive actions. No logic.
 */

import { BasePage } from '../_base.page.js';

export class AddComplaintPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // LOCATORS
  get form() { return this.getTestId('add-complaint-form'); }
  get titleInput() { return this.getTestId('complaint-title-input'); }
  get descriptionInput() { return this.getTestId('complaint-description-input'); }
  get categorySelect() { return this.getTestId('complaint-category-select'); }
  get prioritySelect() { return this.getTestId('complaint-priority-select'); }
  get fileInput() { return this.getTestId('complaint-file-input'); }
  get submitBtn() { return this.getTestId('complaint-submit-btn'); }
  get cancelBtn() { return this.getTestId('complaint-cancel-btn'); }
  get successModal() { return this.getTestId('complaint-success-modal'); }
  get successModalId() { return this.getTestId('success-modal-complaint-id'); }

  // ACTIONS
  async fillTitle(text) { await this.titleInput.fill(text); }
  async fillDescription(text) { await this.descriptionInput.fill(text); }
  async selectCategory(value) { await this.categorySelect.selectOption(value); }
  async selectPriority(value) { await this.prioritySelect.selectOption(value); }
  async uploadFile(path) { await this.fileInput.setInputFiles(path); }
  async submit() { await this.submitBtn.click(); }
  async cancel() { await this.cancelBtn.click(); }

  // READS
  titleValue() { return this.titleInput.inputValue(); }
  descriptionValue() { return this.descriptionInput.inputValue(); }
  isFormVisible() { return this.form.isVisible(); }
  isSuccessModalVisible() { return this.successModal.isVisible(); }
}
