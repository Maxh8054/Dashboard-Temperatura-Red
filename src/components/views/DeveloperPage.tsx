/**
 * MaxReport Pro - Developer Page
 * Information about the developer
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Heart,
  ExternalLink,
} from 'lucide-react'

export function DeveloperPage() {
  const developerInfo = {
    name: 'Desenvolvedor MaxReport',
    title: 'Engenheiro de Software',
    company: 'Zamine',
    avatar: '/logo.svg',
    bio: 'Desenvolvedor especializado em soluções industriais e sistemas de gestão de manutenção. Apaixonado por criar ferramentas que facilitam o trabalho de profissionais em campo.',
    email: 'contato@zamine.com',
    phone: '+55 11 99999-9999',
    linkedin: 'https://linkedin.com/in/zamine',
    github: 'https://github.com/zamine',
    website: 'https://zamine.com',
    skills: [
      'React Native',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Python',
      'SQL',
      'AWS',
      'IoT',
    ],
    experience: [
      {
        title: 'Engenheiro de Software Sênior',
        company: 'Zamine',
        period: '2020 - Presente',
        description: 'Desenvolvimento de soluções digitais para mineração e indústria pesada',
      },
      {
        title: 'Desenvolvedor Full Stack',
        company: 'TechCorp',
        period: '2017 - 2020',
        description: 'Sistemas de gestão e automação industrial',
      },
    ],
    education: [
      {
        degree: 'Engenharia de Software',
        institution: 'Universidade de São Paulo',
        year: '2017',
      },
    ],
  }

  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Sobre o Desenvolvedor</h2>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-primary/60" />
        <CardContent className="pt-0 -mt-12 text-center">
          <Avatar className="w-24 h-24 mx-auto border-4 border-background shadow-lg">
            <AvatarImage src={developerInfo.avatar} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {developerInfo.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="mt-4 text-xl font-bold text-foreground">{developerInfo.name}</h3>
          <p className="text-text-secondary">{developerInfo.title}</p>
          <p className="text-primary font-medium">{developerInfo.company}</p>
          
          <p className="mt-4 text-sm text-text-secondary text-center max-w-sm mx-auto">
            {developerInfo.bio}
          </p>

          {/* Contact Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="outline" size="icon" className="w-10 h-10">
              <Mail className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10">
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10">
              <Github className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="w-10 h-10">
              <Globe className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            Habilidades Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {developerInfo.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-surface">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Experiência Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {developerInfo.experience.map((exp, index) => (
            <div key={index} className="relative pl-4 border-l-2 border-primary/30">
              <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary" />
              <h4 className="font-medium text-foreground">{exp.title}</h4>
              <p className="text-sm text-primary">{exp.company}</p>
              <p className="text-xs text-text-muted">{exp.period}</p>
              <p className="text-sm text-text-secondary mt-1">{exp.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Formação Acadêmica
          </CardTitle>
        </CardHeader>
        <CardContent>
          {developerInfo.education.map((edu, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{edu.degree}</h4>
                <p className="text-sm text-text-secondary">{edu.institution}</p>
                <p className="text-xs text-text-muted">{edu.year}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Project Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Sobre o MaxReport Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-text-secondary">
          <p>
            O <strong className="text-foreground">MaxReport Pro</strong> é um sistema profissional 
            de gestão de relatórios técnicos desenvolvido especificamente para ambientes industriais 
            como mineração, construção e manutenção pesada.
          </p>
          <p>
            Projetado com filosofia <strong className="text-foreground">"Offline First"</strong>, 
            o aplicativo funciona perfeitamente sem conexão com a internet, garantindo 
            confiabilidade em locais remotos.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline">Versão 1.0.0</Badge>
            <Badge className="bg-success/10 text-success">Estável</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-text-muted py-4">
        <p className="flex items-center justify-center gap-1">
          Feito com <Heart className="w-4 h-4 text-danger" /> pela equipe Zamine
        </p>
        <p className="mt-1">© 2026 Z-Report - Todos os direitos reservados</p>
      </div>
    </div>
  )
}
