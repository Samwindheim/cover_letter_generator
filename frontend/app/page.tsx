"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CoverLetterGenerator() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
      toast({
        title: "Resume uploaded",
        description: "Your PDF resume has been uploaded successfully.",
      })
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      })
    }
  }

  const generateCoverLetter = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload your resume and enter a job description.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setCoverLetter("")

    const formData = new FormData()
    formData.append("resume_file", resumeFile)
    formData.append("job_description", jobDescription)

    try {
      const response = await fetch("/generate_cover_letter/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `API Error: ${response.status} ${response.statusText}. ${errorData?.detail || ''}`,
        )
      }

      const data = await response.json()
      setCoverLetter(data.cover_letter)
      toast({
        title: "Cover letter generated",
        description: "Your cover letter has been generated successfully.",
      })
    } catch (error) {
      console.error("Failed to generate cover letter:", error)
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Cover letter has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-indigo-50 p-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pt-8">
          <h1 className="text-4xl font-bold tracking-tight text-teal-800 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Cover Letter Generator
          </h1>
          <p className="text-lg text-slate-700">
            Upload your resume and job description to generate a personalized cover letter
          </p>
          <div className="w-20 h-1 mx-auto bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Resume Upload */}
            <Card className="border border-teal-100 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Resume
                </CardTitle>
                <CardDescription>Upload your resume in PDF format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="resume-upload" className="sr-only">
                    Upload Resume
                  </Label>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {resumeFile && (
                    <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 p-2 rounded-md">
                      <FileText className="h-4 w-4" />
                      <span>{resumeFile.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="border border-teal-100 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the job description or key requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateCoverLetter}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md"
              size="lg"
              disabled={!resumeFile || !jobDescription.trim() || isLoading}
            >
              {isLoading ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </div>

          {/* Output Section */}
          <Card className="h-fit border border-teal-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated Cover Letter
                {coverLetter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
              <CardDescription>Your personalized cover letter will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {coverLetter ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-teal-100 bg-white p-4 shadow-inner">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-sans">
                      {coverLetter}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-slate-500">
                  <div className="text-center space-y-3 p-6 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 border border-dashed border-teal-200 w-full">
                    <FileText className="h-12 w-12 mx-auto text-teal-300" />
                    <p className="text-teal-700">
                      Upload your resume and enter job description to generate cover letter
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-teal-700 pb-8 bg-teal-50 p-3 rounded-full max-w-lg mx-auto">
          <p>Tip: Review and customize the generated cover letter before sending</p>
        </div>
      </div>
    </div>
  )
}
