'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCurrentSite } from '@/hooks/use-current-site';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, GripVertical, Eye, Code, Save } from "lucide-react";
import { toast } from "sonner";

interface ContactFormField {
  id?: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'TEXT' | 'EMAIL' | 'PHONE' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'NUMBER' | 'URL';
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string;
  sortOrder: number;
  isActive: boolean;
}

interface ContactForm {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  fields: ContactFormField[];
}

const fieldTypeLabels = {
  TEXT: 'Text Input',
  EMAIL: 'Email Input',
  PHONE: 'Phone Input',
  TEXTAREA: 'Text Area',
  SELECT: 'Dropdown Select',
  CHECKBOX: 'Checkbox',
  RADIO: 'Radio Buttons',
  NUMBER: 'Number Input',
  URL: 'URL Input'
};

export default function ContactFormManager() {
  const { currentSite } = useCurrentSite();
  const [contactForm, setContactForm] = useState<ContactForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('');

  const fetchContactForm = useCallback(async () => {
    if (!currentSite) return;

    try {
      const response = await fetch(`/api/sites/${currentSite.id}/contact-form`);
      const data = await response.json();
      
      if (data.contactForm) {
        setContactForm(data.contactForm);
      } else {
        // Initialize with default form
        setContactForm({
          name: 'Contact Form',
          description: 'Default contact form for your website',
          isActive: true,
          fields: getDefaultFields()
        });
      }
    } catch (error) {
      console.error('Error fetching contact form:', error);
      toast.error('Failed to load contact form');
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  useEffect(() => {
    if (currentSite) {
      fetchContactForm();
      setApiEndpoint(`${window.location.origin}/api/public/sites/${currentSite.id}/contact`);
    }
  }, [currentSite, fetchContactForm]);

  const getDefaultFields = (): ContactFormField[] => [
    {
      fieldName: 'firstName',
      fieldLabel: 'First Name',
      fieldType: 'TEXT',
      isRequired: true,
      placeholder: 'Enter your first name',
      sortOrder: 1,
      isActive: true
    },
    {
      fieldName: 'lastName',
      fieldLabel: 'Last Name',
      fieldType: 'TEXT',
      isRequired: true,
      placeholder: 'Enter your last name',
      sortOrder: 2,
      isActive: true
    },
    {
      fieldName: 'email',
      fieldLabel: 'Email Address',
      fieldType: 'EMAIL',
      isRequired: false,
      placeholder: 'Enter your email address',
      sortOrder: 3,
      isActive: true
    },
    {
      fieldName: 'companyName',
      fieldLabel: 'Company Name',
      fieldType: 'TEXT',
      isRequired: false,
      placeholder: 'Enter your company name',
      sortOrder: 4,
      isActive: true
    },
    {
      fieldName: 'phoneNumber',
      fieldLabel: 'Phone Number',
      fieldType: 'PHONE',
      isRequired: false,
      placeholder: 'Enter your phone number',
      sortOrder: 5,
      isActive: true
    },
    {
      fieldName: 'reasonForContact',
      fieldLabel: 'Reason for Contact',
      fieldType: 'SELECT',
      isRequired: true,
      options: JSON.stringify([
        'General Inquiry',
        'Support Request',
        'Business Partnership',
        'Feedback',
        'Other'
      ]),
      sortOrder: 6,
      isActive: true
    },
    {
      fieldName: 'message',
      fieldLabel: 'Message',
      fieldType: 'TEXTAREA',
      isRequired: true,
      placeholder: 'Enter your message',
      helpText: 'Please provide details about your inquiry',
      sortOrder: 7,
      isActive: true
    }
  ];

  const handleSave = async () => {
    if (!currentSite || !contactForm) return;

    setSaving(true);
    try {
      const method = contactForm.id ? 'PUT' : 'POST';
      const response = await fetch(`/api/sites/${currentSite.id}/contact-form`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        const data = await response.json();
        setContactForm(data.contactForm);
        toast.success('Contact form saved successfully');
      } else {
        throw new Error('Failed to save contact form');
      }
    } catch (error) {
      console.error('Error saving contact form:', error);
      toast.error('Failed to save contact form');
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    if (!contactForm) return;

    const newField: ContactFormField = {
      fieldName: `field_${Date.now()}`,
      fieldLabel: 'New Field',
      fieldType: 'TEXT',
      isRequired: false,
      sortOrder: contactForm.fields.length + 1,
      isActive: true
    };

    setContactForm({
      ...contactForm,
      fields: [...contactForm.fields, newField]
    });
  };

  const updateField = (index: number, field: Partial<ContactFormField>) => {
    if (!contactForm) return;

    const updatedFields = [...contactForm.fields];
    updatedFields[index] = { ...updatedFields[index], ...field };

    setContactForm({
      ...contactForm,
      fields: updatedFields
    });
  };

  const removeField = (index: number) => {
    if (!contactForm) return;

    setContactForm({
      ...contactForm,
      fields: contactForm.fields.filter((_, i) => i !== index)
    });
  };



  if (loading) {
    return <div>Loading contact form...</div>;
  }

  if (!contactForm) {
    return <div>No contact form found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Form Management</h2>
          <p className="text-muted-foreground">
            Customize your contact form and manage submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
            <CardDescription>
              Configure basic form settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="form-name">Form Name</Label>
              <Input
                id="form-name"
                value={contactForm.name}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  name: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={contactForm.description || ''}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  description: e.target.value
                })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="form-active"
                checked={contactForm.isActive}
                onCheckedChange={(checked) => setContactForm({
                  ...contactForm,
                  isActive: checked
                })}
              />
              <Label htmlFor="form-active">Form is active</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>
                  Customize the fields in your contact form
                </CardDescription>
              </div>
              <Button onClick={addField} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactForm.fields.map((field, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={field.isRequired ? "default" : "secondary"}>
                      {field.isRequired ? "Required" : "Optional"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Field Name</Label>
                    <Input
                      value={field.fieldName}
                      onChange={(e) => updateField(index, { fieldName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Field Label</Label>
                    <Input
                      value={field.fieldLabel}
                      onChange={(e) => updateField(index, { fieldLabel: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Field Type</Label>
                    <Select
                      value={field.fieldType}
                      onValueChange={(value) => updateField(index, { 
                        fieldType: value as ContactFormField['fieldType'] 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(fieldTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={field.isRequired}
                      onCheckedChange={(checked) => updateField(index, { isRequired: checked })}
                    />
                    <Label>Required</Label>
                  </div>
                </div>

                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  />
                </div>

                {field.fieldType === 'SELECT' && (
                  <div>
                    <Label>Options (JSON array)</Label>
                    <Textarea
                      value={field.options || ''}
                      onChange={(e) => updateField(index, { options: e.target.value })}
                      placeholder='["Option 1", "Option 2", "Option 3"]'
                    />
                  </div>
                )}

                <div>
                  <Label>Help Text</Label>
                  <Input
                    value={field.helpText || ''}
                    onChange={(e) => updateField(index, { helpText: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
            <CardDescription>
              Use this endpoint to submit forms from your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>API Endpoint</Label>
              <div className="flex items-center gap-2">
                <Input value={apiEndpoint} readOnly />
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(apiEndpoint)}
                >
                  <Code className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Send a POST request with form data in the format:
                <pre className="mt-2 text-xs bg-muted p-2 rounded">
{`{
  "data": {
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "message": "Hello!"
  }
}`}
                </pre>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 