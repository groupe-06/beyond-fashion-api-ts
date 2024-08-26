import { errors } from '@vinejs/vine';


export class CustomErrorReporter {
  /**
   * A flag to know if one or more errors have been
   * reported
   */
  hasErrors = false

  /**
   * A collection of  . Feel free to give accurate types
   * to this property
   */
  errors: any = {}

  /**
   * VineJS call the report method
   */
  report(message: String, rule:any, field: any, meta: any) {
    this.hasErrors = true

    /**
     * Collecting errors as per the JSONAPI spec
     */

    this.errors[field.wildCardPath] = message;
    
  }

  /**
   * Creates and returns an instance of the
   * ValidationError class
   */
  createError() {
    return new errors.E_VALIDATION_ERROR(this.errors)
  }
}
