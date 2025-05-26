"use client";

import { useState, useEffect } from "react";
import { getItem, updateItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ItemType } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Calendar,
  Key,
  Link,
  FileText,
  Hash,
  User,
  Mail,
  Tag,
  Infinity,
  HardDrive,
  Laptop,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getVendors } from "@/actions/vendors";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox } from "@headlessui/react";

export default function EditItemModal({
  id,
  updateData,
}: {
  id: number;
  updateData: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    productName: "",
    owner: "",
    expirationDate: undefined as Date | undefined,
    subscriptionDate: undefined as Date | undefined,
    purchaseDate: undefined as Date | undefined,
    category: "",
    attachment: "",
    ownerEmail: "",
    productDescription: "",
    licenseKeys: [] as string[],
    requisitionNumber: "",
    vendorId: "",
  });
  const [licenseKeyInputs, setLicenseKeyInputs] = useState<string[]>([""]);
  const [isLifetime, setIsLifetime] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorPopoverOpen, setVendorPopoverOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [vendorQuery, setVendorQuery] = useState("");

  // Fetch item data and vendors on open
  useEffect(() => {
    if (open) {
      getItem(id).then((res) => {
        setData({
          productName: res?.name || "",
          owner: res?.owner || "",
          expirationDate: res?.expirationDate ?? undefined,
          subscriptionDate: res?.subscriptionDate ?? undefined,
          purchaseDate: res?.purchaseDate ?? undefined,
          category: res?.itemType?.toLowerCase() || "software",
          attachment: res?.attachment || "",
          ownerEmail: res?.ownerEmail || "",
          productDescription: res?.description || "",
          licenseKeys: res?.licenseKeys ? res.licenseKeys.map((lk: any) => lk.key) : [],
          requisitionNumber: res?.requisitionNumber || "",
          vendorId: res?.vendorId ? String(res.vendorId) : "", // <-- ensure vendorId is set
        });
        setLicenseKeyInputs(
          res?.licenseKeys && res.licenseKeys.length > 0
            ? res.licenseKeys.map((lk: any) => lk.key)
            : [""]
        );
        setIsLifetime(res?.expirationDate === null);
        setSelectedVendor(res?.vendor || null);
      });
      getVendors().then(setVendors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);

  // Filter vendors based on query
  const filteredVendors =
    vendorQuery === ""
      ? vendors
      : vendors.filter((vendor) =>
          vendor.name.toLowerCase().includes(vendorQuery.toLowerCase())
        );

  const handleLicenseKeyChange = (index: number, value: string) => {
    const updatedInputs = [...licenseKeyInputs];
    updatedInputs[index] = value;
    setLicenseKeyInputs(updatedInputs);
  };

  const addLicenseKeyField = () => {
    setLicenseKeyInputs((prev) => [...prev, ""]);
  };

  const removeLicenseKeyField = (index: number) => {
    if (licenseKeyInputs.length > 1) {
      setLicenseKeyInputs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!data.productName.trim()) errors.productName = "Product name is required";
    if (!data.owner.trim()) errors.owner = "Owner name is required";
    if (!data.ownerEmail.trim()) errors.ownerEmail = "Owner email is required";
    if (data.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)) {
      errors.ownerEmail = "Please enter a valid email address";
    }

    if (data.category === "software" && !data.subscriptionDate) {
      errors.subscriptionDate = "Subscription date is required";
    }

    if (data.category === "software" && !isLifetime && !data.expirationDate) {
      errors.expirationDate = "Please select an expiration date or mark as lifetime";
    }

    if (data.category === "hardware" && !data.purchaseDate) {
      errors.purchaseDate = "Purchase date is required for hardware";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const licenseKeys = licenseKeyInputs.filter((key) => key.trim() !== "");

    await updateItem(id, {
      name: data.productName,
      owner: data.owner,
      expirationDate: isLifetime ? null : data.expirationDate,
      subscriptionDate: data.subscriptionDate,
      purchaseDate: data.purchaseDate,
      itemType: data.category === "software" ? ItemType.SOFTWARE : ItemType.HARDWARE,
      attachment: data.attachment,
      ownerEmail: data.ownerEmail,
      description: data.productDescription,
      licenseKeys,
      numberOfLicenses: licenseKeys.length,
      requisitionNumber: data.requisitionNumber,
      vendorId: data.vendorId ? Number(data.vendorId) : null, // <-- ensure vendorId is passed as number or null
    });

    updateData();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-transparent hover:bg-transparent text-white p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-5 w-5 text-black"
          >
            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
            <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>Edit Product</span>
            <Badge
              variant={data.category === "software" ? "default" : "secondary"}
              className={
                data.category === "software"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : "bg-purple-100 text-purple-800 hover:bg-purple-100"
              }
            >
              {data.category === "software" ? "Software" : "Hardware"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <form id="update-item" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="vendor">Vendor</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Tag className="h-4 w-4" />
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={data.productName}
                  onChange={(e) => setData({ ...data, productName: e.target.value })}
                  type="text"
                  id="name"
                  placeholder="Enter product name"
                  className={`mt-1.5 ${formErrors.productName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {formErrors.productName && <p className="text-red-500 text-xs mt-1">{formErrors.productName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    Owner <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={data.owner}
                    onChange={(e) => setData({ ...data, owner: e.target.value })}
                    type="text"
                    id="owner"
                    placeholder="Enter owner name"
                    className={`mt-1.5 ${formErrors.owner ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {formErrors.owner && <p className="text-red-500 text-xs mt-1">{formErrors.owner}</p>}
                </div>

                <div>
                  <Label
                    htmlFor="owner-email"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                  >
                    <Mail className="h-4 w-4" />
                    Owner Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={data.ownerEmail}
                    onChange={(e) => setData({ ...data, ownerEmail: e.target.value })}
                    type="email"
                    id="owner-email"
                    placeholder="email@example.com"
                    className={`mt-1.5 ${formErrors.ownerEmail ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {formErrors.ownerEmail && <p className="text-red-500 text-xs mt-1">{formErrors.ownerEmail}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  {data.category === "software" ? (
                    <Laptop className="h-4 w-4" />
                  ) : (
                    <HardDrive className="h-4 w-4" />
                  )}
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5 flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="software"
                      name="category"
                      value="software"
                      checked={data.category === "software"}
                      onChange={() => setData({ ...data, category: "software" })}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-500"
                    />
                    <label htmlFor="software" className="ml-2 text-sm text-gray-700">
                      Software
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hardware"
                      name="category"
                      value="hardware"
                      checked={data.category === "hardware"}
                      onChange={() => setData({ ...data, category: "hardware" })}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-500"
                    />
                    <label htmlFor="hardware" className="ml-2 text-sm text-gray-700">
                      Hardware
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Product Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {data.category === "software" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="sub-date"
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                      >
                        <Calendar className="h-4 w-4" />
                        Subscription Date <span className="text-red-500">*</span>
                      </Label>
                      <div className={`mt-1.5 ${formErrors.subscriptionDate ? "border rounded-md border-red-500" : ""}`}>
                        <DatePicker
                          date={data.subscriptionDate}
                          setDate={(v?: Date) => setData({ ...data, subscriptionDate: v })}
                          isExpiration={false}
                        />
                      </div>
                      {formErrors.subscriptionDate && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.subscriptionDate}</p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="exp-date"
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                      >
                        <Calendar className="h-4 w-4" />
                        Expiration Date {!isLifetime && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="mt-1.5">
                        {!isLifetime ? (
                          <div className={formErrors.expirationDate ? "border rounded-md border-red-500" : ""}>
                            <DatePicker
                              date={data.expirationDate}
                              setDate={(v?: Date) => setData({ ...data, expirationDate: v })}
                              isExpiration={true}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center h-10 px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-500">
                            <Infinity className="h-4 w-4 mr-2" />
                            <span>Lifetime</span>
                          </div>
                        )}
                        {formErrors.expirationDate && !isLifetime && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.expirationDate}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="lifetime"
                      checked={isLifetime}
                      onCheckedChange={(checked) => {
                        setIsLifetime(checked);
                        if (checked) {
                          setData({ ...data, expirationDate: undefined });
                          if (formErrors.expirationDate) {
                            const { expirationDate, ...rest } = formErrors;
                            setFormErrors(rest);
                          }
                        }
                      }}
                    />
                    <Label htmlFor="lifetime" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Infinity className="h-4 w-4" />
                      Lifetime Subscription
                    </Label>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label
                        htmlFor="license-keys"
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                      >
                        <Key className="h-4 w-4" />
                        License Keys
                      </Label>
                      <Button
                        type="button"
                        onClick={addLicenseKeyField}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Key
                      </Button>
                    </div>

                    {licenseKeyInputs.map((key, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          type="text"
                          placeholder={`License Key ${index + 1}`}
                          value={key}
                          onChange={(e) => handleLicenseKeyChange(index, e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                        <Button
                          type="button"
                          onClick={() => removeLicenseKeyField(index)}
                          variant="outline"
                          size="icon"
                          className={`h-10 w-10 ${licenseKeyInputs.length === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={licenseKeyInputs.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-1">
                      {licenseKeyInputs.filter((k) => k.trim() !== "").length} license key(s) added
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <Label
                    htmlFor="purchase-date"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                  >
                    <Calendar className="h-4 w-4" />
                    Purchase Date <span className="text-red-500">*</span>
                  </Label>
                  <div className={`mt-1.5 ${formErrors.purchaseDate ? "border rounded-md border-red-500" : ""}`}>
                    <DatePicker
                      date={data.purchaseDate}
                      setDate={(v?: Date) => setData({ ...data, purchaseDate: v })}
                      isExpiration={false}
                    />
                  </div>
                  {formErrors.purchaseDate && <p className="text-red-500 text-xs mt-1">{formErrors.purchaseDate}</p>}

                  <div className="mt-4">
                    <Label htmlFor="exp-date" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4" />
                      Warranty Expiration Date
                    </Label>
                    <DatePicker
                      date={data.expirationDate}
                      setDate={(v?: Date) => setData({ ...data, expirationDate: v })}
                      isExpiration={true}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank if the hardware has a lifetime warranty</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Vendor Tab */}
            <TabsContent value="vendor" className="space-y-4">
              <div>
                <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Building2 className="h-4 w-4" />
                  Vendor <span className="text-red-500">*</span>
                </Label>
                <Combobox
                  value={selectedVendor}
                  onChange={(vendor) => {
                    setSelectedVendor(vendor);
                    setData((prev) => ({
                      ...prev,
                      vendorId: vendor && vendor.id ? vendor.id : undefined,
                    }));
                  }}
                >
                  <div className="relative mt-1.5">
                    <Combobox.Input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      displayValue={(vendor: any) => vendor?.name || ""}
                      onChange={(e) => setVendorQuery(e.target.value)}
                      placeholder="Search vendor..."
                      required
                    />
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                      {filteredVendors.length === 0 && vendorQuery !== "" ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          No vendors found.
                        </div>
                      ) : (
                        filteredVendors.map((vendor) => (
                          <Combobox.Option
                            key={vendor.id}
                            value={vendor}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active ? "bg-primary/10 text-primary" : "text-gray-700"
                              }`
                            }
                          >
                            {vendor.name}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
                {selectedVendor && (
                  <div className="mt-4 border rounded-md p-3 bg-gray-50">
                    <div className="font-semibold text-gray-800">{selectedVendor.name}</div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Contact:</span> {selectedVendor.contact}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Email:</span> {selectedVendor.email}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Additional Info Tab */}
            <TabsContent value="additional" className="space-y-4">
              <div>
                <Label
                  htmlFor="requisition-number"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                >
                  <Hash className="h-4 w-4" />
                  Requisition Number
                </Label>
                <Input
                  value={data.requisitionNumber}
                  onChange={(e) => setData({ ...data, requisitionNumber: e.target.value })}
                  type="text"
                  id="requisition-number"
                  placeholder="Enter requisition number"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="attachment" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Link className="h-4 w-4" />
                  Attachment URL
                </Label>
                <Input
                  value={data.attachment}
                  onChange={(e) => setData({ ...data, attachment: e.target.value })}
                  type="text"
                  id="attachment"
                  placeholder="https://example.com/document.pdf"
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">Add a link to any relevant documentation or files</p>
              </div>

              <div>
                <Label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <FileText className="h-4 w-4" />
                  Product Description
                </Label>
                <Textarea
                  value={data.productDescription}
                  onChange={(e) => setData({ ...data, productDescription: e.target.value })}
                  id="description"
                  placeholder="Enter a detailed description of the product..."
                  className="mt-1.5 min-h-[120px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                Update
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}