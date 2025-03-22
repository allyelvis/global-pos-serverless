"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { getFiscalRegions, createFiscalRegion, deleteFiscalRegion } from "@/lib/services/fiscal-compliance-service"

const fiscalRegionSchema = z.object({
  code: z.string().min(2, "Country code must be at least 2 characters"),
  name: z.string().min(3, "Region name must be at least 3 characters"),
  country: z.string().min(2, "Country name must be at least 2 characters"),
})

export function FiscalComplianceSettings() {
  const [regions, setRegions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const form = useForm<z.infer<typeof fiscalRegionSchema>>({
    resolver: zodResolver(fiscalRegionSchema),
    defaultValues: {
      code: "",
      name: "",
      country: "",
    },
  })

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await getFiscalRegions()
        setRegions(data)
        if (data.length > 0) {
          setSelectedRegion(data[0].id)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load fiscal regions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadRegions()
  }, [])

  const onSubmit = async (values: z.infer<typeof fiscalRegionSchema>) => {
    try {
      const result = await createFiscalRegion({
        ...values,
        taxRules: [],
        fiscalRequirements: [],
      })

      if (result) {
        toast({
          title: "Success",
          description: "Fiscal region created successfully",
        })

        // Refresh regions
        const data = await getFiscalRegions()
        setRegions(data)
        setSelectedRegion(result.id)
        form.reset()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create fiscal region",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRegion = async (id: string) => {
    if (confirm("Are you sure you want to delete this fiscal region?")) {
      try {
        const success = await deleteFiscalRegion(id)
        if (success) {
          toast({
            title: "Success",
            description: "Fiscal region deleted successfully",
          })

          // Refresh regions
          const data = await getFiscalRegions()
          setRegions(data)
          if (data.length > 0) {
            setSelectedRegion(data[0].id)
          } else {
            setSelectedRegion(null)
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete fiscal region",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fiscal Compliance Settings</CardTitle>
          <CardDescription>Configure fiscal compliance settings for different regions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="regions">
            <TabsList className="mb-4">
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="add">Add Region</TabsTrigger>
            </TabsList>

            <TabsContent value="regions">
              {loading ? (
                <div className="text-center py-4">Loading regions...</div>
              ) : regions.length === 0 ? (
                <div className="text-center py-4">No fiscal regions found. Add a region to get started.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Select value={selectedRegion || undefined} onValueChange={setSelectedRegion}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name} ({region.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRegion && (
                    <div className="border rounded-md p-4">
                      {regions.find((r) => r.id === selectedRegion) && (
                        <>
                          <h3 className="text-lg font-medium mb-2">
                            {regions.find((r) => r.id === selectedRegion)?.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium">Code</p>
                              <p className="text-sm text-muted-foreground">
                                {regions.find((r) => r.id === selectedRegion)?.code}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Country</p>
                              <p className="text-sm text-muted-foreground">
                                {regions.find((r) => r.id === selectedRegion)?.country}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Tax Rules</h4>
                              {regions.find((r) => r.id === selectedRegion)?.taxRules.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No tax rules defined</p>
                              ) : (
                                <ul className="space-y-2">
                                  {regions
                                    .find((r) => r.id === selectedRegion)
                                    ?.taxRules.map((rule: any) => (
                                      <li key={rule.id} className="text-sm">
                                        {rule.name}: {(rule.rate * 100).toFixed(2)}%
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2">Fiscal Requirements</h4>
                              {regions.find((r) => r.id === selectedRegion)?.fiscalRequirements.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No fiscal requirements defined</p>
                              ) : (
                                <ul className="space-y-2">
                                  {regions
                                    .find((r) => r.id === selectedRegion)
                                    ?.fiscalRequirements.map((req: any) => (
                                      <li key={req.id} className="text-sm">
                                        {req.name}: {req.isRequired ? "Required" : "Optional"}
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          <div className="mt-4">
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteRegion(selectedRegion)}>
                              Delete Region
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="add">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region Code</FormLabel>
                        <FormControl>
                          <Input placeholder="US, EU, etc." {...field} />
                        </FormControl>
                        <FormDescription>A short code to identify the fiscal region</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region Name</FormLabel>
                        <FormControl>
                          <Input placeholder="United States, European Union, etc." {...field} />
                        </FormControl>
                        <FormDescription>The full name of the fiscal region</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States, Multiple, etc." {...field} />
                        </FormControl>
                        <FormDescription>The country or countries this region applies to</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Add Fiscal Region</Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

